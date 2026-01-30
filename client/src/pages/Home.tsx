import { useState, useRef } from 'react';
import { useReadingSession } from '@/hooks/use-reading-session';
import { extractTextFromPdf, parseTextFile } from '@/lib/pdf-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, PlayCircle, Loader2, BookOpen } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const { session, startNewSession, hasSession } = useReadingSession();
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      let content = '';
      const fileName = file.name.toLowerCase();
      const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
      const isTxt = file.type === 'text/plain' || fileName.endsWith('.txt');

      if (isPdf) {
        content = await extractTextFromPdf(file);
      } else if (isTxt) {
        content = await parseTextFile(file);
      } else {
        throw new Error('Unsupported file type. Please upload .txt or .pdf');
      }

      if (!content.trim()) {
        throw new Error('File appears to be empty or unreadable.');
      }

      startNewSession(content, file.name);
      setLocation('/reader');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dot-pattern bg-[length:24px_24px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">
            SPEED READER
          </h1>
          <p className="text-muted-foreground text-lg">
            Absorb knowledge at the speed of thought.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn("h-full", !hasSession && "opacity-50 pointer-events-none grayscale")}
          >
            <Card className="h-full bg-card/50 border-border hover:border-primary/50 transition-colors backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-primary" />
                  Resume Session
                </CardTitle>
                <CardDescription>
                  Continue where you left off
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {session ? (
                  <>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                      <p className="font-medium truncate text-foreground">{session.filename}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Word {session.wordIndex}</span>
                        <span>{session.wpm} WPM</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      onClick={() => setLocation('/reader')}
                      data-testid="button-resume-reading"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Resume Reading
                    </Button>
                  </>
                ) : (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-sm italic">
                    No active session found
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card 
              className={cn(
                "h-full border-dashed transition-all cursor-pointer relative overflow-hidden",
                dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "bg-card/50 border-border hover:border-primary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="text-primary" />
                  New Upload
                </CardTitle>
                <CardDescription>
                  Start a new reading session
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-40 text-center space-y-4">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Parsing document...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-secondary/50 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Drop PDF or TXT here</p>
                      <p className="text-xs text-muted-foreground">or click to browse</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept=".txt,.pdf" 
                  className="hidden" 
                />
              </CardContent>
              {dragActive && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                  <p className="text-primary font-bold text-lg">Drop to upload</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
