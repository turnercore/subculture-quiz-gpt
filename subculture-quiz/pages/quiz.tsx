import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import Confetti from 'react-confetti';

interface Answer {
  [key: string]: {
    [key: string]: number;
  };
}

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative inline-block"
    >
      {children}
      {showTooltip && (
        <div
          className="absolute z-10 w-64 p-2 mt-2 text-sm leading-tight text-black transform -translate-x-1/2 -translate-y-full bg-white rounded-lg shadow-lg"
          style={{ bottom: '100%', left: '50%' }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

interface Question {
  question: string;
  answers: Answer[];
}

interface Subculture {
  name: string;
  description: string;
}

const capitalize = (s: string) => {
    if (typeof s !== 'string') return ''
    return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

const Quiz: React.FC = () => {
  const [quizData, setQuizData] = useState<Question[]>([]);
  const [subcultures, setSubcultures] = useState<Subculture[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    fetch('/api/quiz')
      .then((response) => response.json())
      .then((data) => setQuizData(data));

    fetch('/api/subcultures')
      .then((response) => response.json())
      .then((data) => setSubcultures(data));
  }, []);

  const handleAnswer = (answer: Answer) => {
    const newScores = { ...scores };
    const answerOption = Object.keys(answer)[0];
    const subcultureScores = answer[answerOption];
    for (let subculture in subcultureScores) {
      newScores[subculture] = (newScores[subculture] || 0) + subcultureScores[subculture];
    }
    setScores(newScores);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleShowResult = () => {
    setShowResult(true);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  // Sort scores and convert to array of tuples
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!quizStarted ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">What subculture are you part of?</h1>
          <button
            onClick={startQuiz}
            className="bg-blue-500 text-white rounded py-2 px-4"
          >
            Take the quiz
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-8">Quiz Page</h1>
          {!showResult ? (
            <Transition
              show={currentQuestionIndex < quizData.length}
              enter="transition-opacity duration-1000"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-1000"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {quizData[currentQuestionIndex] && (
                <div key={currentQuestionIndex} className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">
                    {quizData[currentQuestionIndex].question}
                  </h2>
                  {quizData[currentQuestionIndex].answers.map((answer, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(answer)}
                      className="block w-64 mx-auto mb-2 bg-blue-500 text-white rounded py-2"
                    >
                      {Object.keys(answer)[0]}
                    </button>
                  ))}
                </div>
              )}
            </Transition>
          ) : (
            <div>
              <h1 className="text-3xl font-semibold mb-4">Result</h1>
              <p className="text-xl">
                {capitalize(sortedScores[0][0])}
              </p>
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={showResult ? 500 : 0}
                recycle={false}
              />
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">All Scores</h2>
                {sortedScores.map(([subculture, score], i) => {
                  const description = subcultures.find(
                    (s) => s.name.toLowerCase() === subculture
                  )?.description;
                  return (
                    <div key={i} className="mb-2">
                      <span className="font-semibold">{capitalize(subculture)}:</span> {score}{' '}
                      <span title={description} className="text-gray-500 cursor-help">
                        (i)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {currentQuestionIndex === quizData.length && !showResult && (
            <button
              onClick={handleShowResult}
              className="mt-8 bg-green-500 text-white rounded py-2 px-4"
            >
              Display Results
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
