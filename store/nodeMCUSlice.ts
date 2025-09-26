import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReadingData {
  id: string;
  name?: string;
  readingCount: number; // Store count instead of raw reading object
  timestamp: string; // Changed to string for Redux serialization
}

interface IndividualReading {
  timestamp: string; // Changed to string for Redux serialization
  value: number;
  documentId: string;
}

interface ProcessedReadingData {
  documents: ReadingData[];
  individualReadings: IndividualReading[];
}

interface NodeMCUState {
  documentCount: number; // This now represents total readings count
  readingData: ProcessedReadingData; // Store processed reading data for graph
  loading: boolean;
  error: string | null;
}

const initialState: NodeMCUState = {
  documentCount: 0, // Total readings across all documents
  readingData: { documents: [], individualReadings: [] }, // Processed reading data for analysis
  loading: false,
  error: null,
};

const nodeMCUSlice = createSlice({
  name: 'nodeMCU',
  initialState,
  reducers: {
    setDocumentCount: (state, action: PayloadAction<number>) => {
      state.documentCount = action.payload;
      state.loading = false;
      state.error = null;
    },
    setReadingData: (state, action: PayloadAction<ProcessedReadingData>) => {
      state.readingData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setDocumentCount, setReadingData, setLoading, setError, clearError } = nodeMCUSlice.actions;
export default nodeMCUSlice.reducer;
