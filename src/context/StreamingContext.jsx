import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import ApiService from '../services/api';

const StreamingContext = createContext(null);

const initialState = {
  isStreaming: false,
  streamedTokens: [],
  fullText: '',
  currentQuestion: null,
  sessionActive: false,
  error: null,
};

function streamingReducer(state, action) {
  switch (action.type) {
    case 'START_STREAM':
      return {
        ...state,
        isStreaming: true,
        streamedTokens: [],
        fullText: '',
        currentQuestion: action.payload,
        error: null,
      };
    case 'APPEND_TOKEN':
      return {
        ...state,
        streamedTokens: [...state.streamedTokens, action.payload],
        fullText: state.fullText + action.payload,
      };
    case 'END_STREAM':
      return { ...state, isStreaming: false };
    case 'SET_SESSION':
      return { ...state, sessionActive: action.payload };
    case 'RESET':
      return { ...initialState };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isStreaming: false };
    default:
      return state;
  }
}

export function StreamingProvider({ children }) {
  const [state, dispatch] = useReducer(streamingReducer, initialState);
  const abortRef = useRef(false);

  const startQuestionStream = useCallback(async (question) => {
    abortRef.current = false;
    dispatch({ type: 'START_STREAM', payload: question });

    try {
      await ApiService.streamInterviewerQuestion(
        question.question,
        (token) => {
          if (!abortRef.current) {
            dispatch({ type: 'APPEND_TOKEN', payload: token });
          }
        },
        () => {
          if (!abortRef.current) {
            dispatch({ type: 'END_STREAM' });
          }
        }
      );
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const abortStream = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: 'END_STREAM' });
  }, []);

  const resetStream = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: 'RESET' });
  }, []);

  const setSessionActive = useCallback((active) => {
    dispatch({ type: 'SET_SESSION', payload: active });
  }, []);

  return (
    <StreamingContext.Provider
      value={{
        ...state,
        startQuestionStream,
        abortStream,
        resetStream,
        setSessionActive,
      }}
    >
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreaming() {
  const ctx = useContext(StreamingContext);
  if (!ctx) throw new Error('useStreaming must be used within StreamingProvider');
  return ctx;
}

export default StreamingContext;
