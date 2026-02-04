import { useState, useRef } from 'react';
import { useReadingSession } from '@/hooks/use-reading-session';
import { extractTextFromPdf, parseTextFile } from '@/lib/pdf-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, PlayCircle, Loader2, BookOpen, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { easeInOut, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const DEMO_TEXT =
  "Welcome to the future of reading. You are currently experiencing Rapid Serial Visual Presentation, or RSVP. Traditional reading is limited by the speed of your eye movements. Your eyes have to jump from word to word, a process called saccade. This physical movement wastes time and breaks your focus. Ready Read eliminates this barrier. By presenting words one by one at a fixed point, we bypass the need for eye movement. This allows you to absorb information directly into your mind, silencing the inner voice that slows you down. This state is known as Flow. In this mode, your comprehension does not drop; instead, your focus intensifies. Imagine reading a business report in minutes or finishing a novel in an afternoon. This tool is not just about speed; it is about reclaiming your time and upgrading your cognitive input. You are now ready to upload your own documents. Enjoy the speed of thought.";

export default function Home() {
  const { session, startNewSession, hasSession } = useReadingSession();
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("[Home] Archivo seleccionado (input)", file ? { name: file.name, type: file.type, size: file.size } : null);
    if (file) await processFile(file);
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    console.log("[Home] Procesando archivo...", { name: file.name, type: file.type, size: file.size });

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

      if (!content.trim()) throw new Error('File appears to be empty or unreadable.');

      startNewSession(content, file.name);
      setLocation('/reader');
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Failed to process file';
      setError(msg);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
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
    // CONTENEDOR PRINCIPAL
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#09090b]">
      
      {/* === FONDO AURORA CORREGIDO === */}
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        
        {/* LUZ 1: CIAN (Arriba Izquierda) - Animación Normal */}
        <div 
          className="absolute top-[-10%] left-[-10%] rounded-full opacity-40 animate-pulse"
          style={{ 
            width: '600px', 
            height: '600px', 
            background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0) 70%)',
            filter: 'blur(80px)',
            transform: 'translateZ(0)',
          }} 
        />
        
        {/* LUZ 2: VIOLETA (Abajo Derecha) - AGREGADO animate-pulse y delay */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] rounded-full opacity-30 animate-pulse"
          style={{ 
            width: '700px', 
            height: '700px', 
            background: 'radial-gradient(circle, rgba(124,58,237,0.8) 0%, rgba(124,58,237,0) 70%)',
            filter: 'blur(100px)',
            transform: 'translateZ(0)',
            animationDelay: '1s' // Para que no pulse igual al cian
          }} 
        />
        
        {/* LUZ 3: AZUL (Centro) - AGREGADO animate-pulse y delay mas largo */}
        <div 
          className="absolute top-[50%] left-[50%] rounded-full opacity-20 animate-pulse"
          style={{ 
            width: '900px', 
            height: '900px', 
            background: 'radial-gradient(circle, rgba(37,99,235,0.6) 0%, rgba(37,99,235,0) 70%)',
            filter: 'blur(120px)',
            transform: 'translate(-50%, -50%) translateZ(0)',
            animationDelay: '2s' // Ritmo distinto
          }} 
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl space-y-12 relative z-10"
      >
        <div className="text-center space-y-4">
          <motion.h1
            className="text-5xl md:text-8xl font-bold tracking-tighter"
            // CORRECCIÓN ANIMACIÓN: Más rango (15px) y más rápido (2s) para fluidez
            animate={{ y: [-15, 15] }}
            transition={{ duration: 2, ease: easeInOut, repeat: Infinity, repeatType: "mirror" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              READY{" "}
            </span>
            <span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white"
              style={{ filter: 'drop-shadow(0 0 25px rgba(6,182,212,0.6))' }}
            >
              READ
            </span>
          </motion.h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto drop-shadow-md">
            Absorb knowledge at the speed of thought.
          </p>
        </div>

        {/* ... (EL RESTO DEL GRID DE TARJETAS SIGUE IGUAL) ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Resume Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn("h-full", !hasSession && "opacity-50 pointer-events-none grayscale")}
          >
            <Card className="h-full bg-black/40 border-white/10 hover:border-primary/50 transition-colors backdrop-blur-md">
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
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="font-medium truncate text-foreground">{session.filename}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Word {session.wordIndex}</span>
                        <span>{session.wpm} WPM</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      onClick={() => {
                        console.log("[Home] Click en Resume Reading -> /reader");
                        setLocation('/reader');
                      }}
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

          {/* 2. Tutorial / Demo Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card
              className="h-full bg-black/40 border-white/10 hover:border-primary/50 transition-colors backdrop-blur-md cursor-pointer"
              onClick={() => {
                console.log("[Home] Click en TRY ME -> start demo session");
                startNewSession(DEMO_TEXT, "Instant Demo", { isDemo: true });
              }}
              data-testid="card-try-me"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="text-primary" />
                  Tutorial
                </CardTitle>
                <CardDescription>See how everything works!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground">
                    Start an instant demo session and jump straight into Flow ;)
                  </p>
                </div>

                <motion.div
                  whileHover={{ x: [0, -2, 2, -2, 2, 0], rotate: [0, -1, 1, -1, 1, 0] }}
                  transition={{ duration: 0.35, repeat: Infinity, repeatType: "loop" }}
                >
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                    type="button"
                    data-testid="button-try-me"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    TRY ME
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. Upload Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card 
              className={cn(
                "h-full border-dashed transition-all cursor-pointer relative overflow-hidden backdrop-blur-md",
                dragActive ? "border-primary bg-primary/10 scale-[1.02]" : "bg-black/40 border-white/10 hover:border-primary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                console.log("[Home] Click en Upload -> abriendo selector");
                fileInputRef.current?.click();
              }}
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
                    <div className="p-4 rounded-full bg-white/5 text-muted-foreground">
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
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}