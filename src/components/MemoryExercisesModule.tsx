import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle2, RotateCcw, Trophy, Award, HelpCircle, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { speakText } from '../utils/speech';

interface CognitiveScoreEntry {
  id: string;
  date: string;
  timestamp: string;
  gameType: string;
  score: number;
  accuracy: number;
  completedBy: string;
}

interface MemoryExercisesModuleProps {
  seniorName?: string;
  userRole?: 'senior' | 'caregiver';
  onScoreUpdated?: (score: number) => void;
}

export const MemoryExercisesModule: React.FC<MemoryExercisesModuleProps> = ({
  seniorName = 'Eleanor',
  userRole = 'senior',
  onScoreUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'words' | 'photo' | 'numbers'>('words');
  
  // Word Recall Game State
  const wordSet = ['Rose', 'Teapot', 'Garden', 'Sunshine', 'Melody'];
  const [showWords, setShowWords] = useState(true);
  const [timeLeft, setTimeLeft] = useState(8);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordGameSubmitted, setWordGameSubmitted] = useState(false);
  const [wordScore, setWordScore] = useState<number | null>(null);

  // Photo Memory Recall State
  const photoOptions = [
    { id: '1', title: 'Granddaughter Maya in the park', isCorrect: true, hint: 'Has a yellow sunhat' },
    { id: '2', title: 'Family picnic in summer 2022', isCorrect: true, hint: 'On green blanket' },
    { id: '3', title: 'Cat Whiskers by the fireplace', isCorrect: false, hint: 'Pet portrait' },
    { id: '4', title: 'Neighbor John harvesting apples', isCorrect: false, hint: 'Apple orchard' },
  ];
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [photoSubmitted, setPhotoSubmitted] = useState(false);
  const [photoScore, setPhotoScore] = useState<number | null>(null);

  // Score History
  const [history, setHistory] = useState<CognitiveScoreEntry[]>([
    { id: '1', date: 'Aug 7', timestamp: '10:00 AM', gameType: 'Word Memory', score: 95, accuracy: 100, completedBy: 'Eleanor' },
    { id: '2', date: 'Aug 6', timestamp: '03:15 PM', gameType: 'Photo Recall', score: 90, accuracy: 92, completedBy: 'Eleanor' },
    { id: '3', date: 'Aug 5', timestamp: '11:20 AM', gameType: 'Routine Pattern', score: 88, accuracy: 88, completedBy: 'Eleanor' },
  ]);

  // Countdown timer for word memory
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showWords && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setShowWords(false);
    }
    return () => clearTimeout(timer);
  }, [showWords, timeLeft]);

  const handleStartWordGame = () => {
    setShowWords(true);
    setTimeLeft(8);
    setSelectedWords([]);
    setWordGameSubmitted(false);
    setWordScore(null);
    speakText(`Here are 5 gentle memory words: Rose, Teapot, Garden, Sunshine, Melody. Try to remember them!`);
  };

  const handleToggleWord = (word: string) => {
    if (wordGameSubmitted) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmitWordGame = () => {
    const correctCount = selectedWords.filter((w) => wordSet.includes(w)).length;
    const score = Math.round((correctCount / wordSet.length) * 100);
    setWordScore(score);
    setWordGameSubmitted(true);

    const newLog: CognitiveScoreEntry = {
      id: `score-${Date.now()}`,
      date: 'Today',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gameType: 'Word Memory',
      score,
      accuracy: score,
      completedBy: seniorName,
    };

    setHistory([newLog, ...history]);
    if (onScoreUpdated) onScoreUpdated(score);

    speakText(`Wonderful job ${seniorName}! You scored ${score} percent on your memory recall game.`);
  };

  const handleSubmitPhotoRecall = () => {
    const correctAnswers = photoOptions.filter((p) => p.isCorrect).map((p) => p.id);
    const correctSelected = selectedPhotoIds.filter((id) => correctAnswers.includes(id)).length;
    const score = Math.round((correctSelected / correctAnswers.length) * 100);
    setPhotoScore(score);
    setPhotoSubmitted(true);

    const newLog: CognitiveScoreEntry = {
      id: `score-${Date.now()}`,
      date: 'Today',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gameType: 'Photo Memory',
      score,
      accuracy: score,
      completedBy: seniorName,
    };

    setHistory([newLog, ...history]);
    if (onScoreUpdated) onScoreUpdated(score);
  };

  const allWordsOptions = ['Rose', 'Teapot', 'Orchard', 'Garden', 'Blanket', 'Sunshine', 'Melody', 'Spoon', 'Willow'];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Memory & Cognitive Fitness Gym</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Enjoyable memory games designed for mental alertness & focus tracking
            </p>
          </div>
        </div>

        {/* EXERCISE SELECTOR TABS */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('words')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'words' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Word Recall
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'photo' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Photo Memory
          </button>
        </div>
      </div>

      {/* GAME AREA 1: WORD RECALL */}
      {activeTab === 'words' && (
        <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Exercise 1: 5-Word Association</span>
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {showWords
                  ? `Memorize these 5 gentle words before time runs out (${timeLeft}s)`
                  : 'Select the 5 words you remember seeing!'}
              </p>
            </div>

            {!showWords && !wordGameSubmitted && (
              <button
                onClick={handleStartWordGame}
                className="text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            )}
          </div>

          {/* MEMORIZE PHASE */}
          {showWords ? (
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-200 text-center space-y-4 shadow-sm">
              <div className="flex flex-wrap justify-center gap-3">
                {wordSet.map((word) => (
                  <span
                    key={word}
                    className="px-4 py-2.5 bg-purple-600 text-white font-extrabold text-lg sm:text-xl rounded-xl shadow-sm animate-pulse"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-xs text-purple-800 font-bold">
                Covering words in <span className="text-purple-900 text-sm font-black">{timeLeft}</span> seconds...
              </p>
            </div>
          ) : (
            /* RECALL PHASE */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                {allWordsOptions.map((word) => {
                  const isSelected = selectedWords.includes(word);
                  return (
                    <button
                      key={word}
                      onClick={() => handleToggleWord(word)}
                      disabled={wordGameSubmitted}
                      className={`p-3.5 rounded-xl border font-bold text-sm sm:text-base text-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>

              {!wordGameSubmitted ? (
                <button
                  onClick={handleSubmitWordGame}
                  disabled={selectedWords.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check Answers ({selectedWords.length}/5 Selected)</span>
                </button>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-purple-200 text-center space-y-2">
                  <div className="text-lg font-black text-purple-900 flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>Memory Recall Score: {wordScore}%</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    You recalled {selectedWords.filter((w) => wordSet.includes(w)).length} of 5 words correctly!
                  </p>
                  <button
                    onClick={handleStartWordGame}
                    className="mt-2 text-xs font-bold text-purple-700 bg-purple-100 px-4 py-2 rounded-xl hover:bg-purple-200"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME AREA 2: PHOTO MEMORY */}
      {activeTab === 'photo' && (
        <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-purple-500" />
              <span>Exercise 2: Family & Memory Photo Recall</span>
            </span>
            <p className="text-sm font-semibold text-slate-800">
              Which family moments took place this month? Select all matching memories:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {photoOptions.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    if (photoSubmitted) return;
                    setSelectedPhotoIds(
                      isSelected
                        ? selectedPhotoIds.filter((id) => id !== photo.id)
                        : [...selectedPhotoIds, photo.id]
                    );
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>{photo.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <p className={`text-xs ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                    Hint: {photo.hint}
                  </p>
                </div>
              );
            })}
          </div>

          {!photoSubmitted ? (
            <button
              onClick={handleSubmitPhotoRecall}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm shadow-sm"
            >
              Submit Photo Memory Test
            </button>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-purple-200 text-center space-y-2">
              <div className="text-lg font-black text-purple-900">
                Photo Memory Score: {photoScore}%
              </div>
              <p className="text-xs text-slate-600">Great recognition accuracy maintained!</p>
            </div>
          )}
        </div>
      )}

      {/* COGNITIVE SCORE HISTORY */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-purple-600" />
          <span>Recent Memory Score Audits</span>
        </h4>

        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                  {item.gameType}
                </span>
                <span className="text-slate-700">{item.date} @ {item.timestamp}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">By {item.completedBy}</span>
                <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded-full font-extrabold">
                  {item.score}% Score
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
