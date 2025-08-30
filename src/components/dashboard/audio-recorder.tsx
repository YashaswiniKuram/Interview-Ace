'use client';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';

type AudioRecorderProps = {
  onRecordingComplete: (audioDataUri: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
};

export type AudioRecorderHandle = {
  reset: () => void;
};

export const AudioRecorder = forwardRef<AudioRecorderHandle, AudioRecorderProps>(
  ({ onRecordingComplete, isProcessing, disabled = false }, ref) => {
    const { isRecording, startRecording, stopRecording, recordingTime, resetTimer } =
      useAudioRecorder({ onRecordingComplete });

    useImperativeHandle(ref, () => ({
      reset() {
        resetTimer();
      },
    }));
  
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    };
  
    const isDisabled = disabled || isProcessing;
  
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          className="rounded-full w-20 h-20 shadow-lg"
          disabled={isDisabled}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
        <div className="w-20 text-center">
          {isProcessing ? (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>...</span>
            </div>
          ) : (
            <span className="text-lg font-mono font-semibold">
              {formatTime(recordingTime)}
            </span>
          )}
        </div>
      </div>
    );
  }
);

AudioRecorder.displayName = 'AudioRecorder';
