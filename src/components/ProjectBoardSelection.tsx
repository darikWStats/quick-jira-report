import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { Project, Board } from '../services/api';

interface ProjectBoardSelectionProps {
  projects: Project[];
  boards: Board[];
  selectedProjectId: string;
  boardId: string;
  loadingBoards: boolean;
  onProjectChange: (projectId: string) => void;
  onBoardChange: (boardId: string) => void;
}

export function ProjectBoardSelection({
  projects,
  boards,
  selectedProjectId,
  boardId,
  loadingBoards,
  onProjectChange,
  onBoardChange
}: ProjectBoardSelectionProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FolderIcon color="primary" />
        Project & Board Selection
      </Typography>
      
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Autocomplete
          fullWidth
          options={projects}
          getOptionLabel={(option) => option.name}
          filterOptions={(options, { inputValue }) => {
            const searchValue = inputValue.toLowerCase();
            return options.filter(option => 
              option.name.toLowerCase().includes(searchValue) ||
              option.key.toLowerCase().includes(searchValue)
            );
          }}
          value={projects.find(p => p.id === selectedProjectId) || null}
          onChange={(event, newValue) => {
            onProjectChange(newValue ? newValue.id : '');
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.key}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Project"
              placeholder="Search by project name or key..."
              margin="normal"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mr: 1 }}>
                    <FolderIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
                  </Box>
                ),
              }}
            />
          )}
        />

        <FormControl fullWidth margin="normal" disabled={!selectedProjectId || loadingBoards}>
          <InputLabel>Select Board</InputLabel>
          <Select
            value={boardId}
            onChange={(e) => onBoardChange(e.target.value)}
            label="Select Board"
          >
            {boards.map((board) => (
              <MenuItem key={board.id} value={board.id}>
                {board.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loadingBoards && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <Typography variant="caption">Loading boards...</Typography>
        </Box>
      )}
    </Box>
  );
}
