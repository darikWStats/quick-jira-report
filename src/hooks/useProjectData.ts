import { useState } from 'react';
import { ApiService, AuthData, Project, Board, Sprint } from '../services/api';
import { FormData as FormDataType } from '../utils/validation';

interface UseProjectDataProps {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  showError: (message: string) => void;
  projects: Project[];
}

interface UseProjectDataReturn {
  boards: Board[];
  sprints: Sprint[];
  selectedProjectId: string;
  selectedSprintIds: string[];
  loadingBoards: boolean;
  loadingSprints: boolean;
  handleProjectChange: (projectId: string) => Promise<void>;
  handleBoardChange: (boardId: string) => Promise<void>;
  handleSprintSelection: (sprintIds: string[]) => void;
  handleSprintChange: (event: any, newValue: Sprint | null) => void;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
  setSelectedSprintIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useProjectData({ 
  formData, 
  setFormData, 
  showError, 
  projects 
}: UseProjectDataProps): UseProjectDataReturn {
  const [boards, setBoards] = useState<Board[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingSprints, setLoadingSprints] = useState(false);

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setBoards([]);
    setSprints([]);
    setFormData(prev => ({ ...prev, boardId: '', sprintId: '' }));

    if (projectId) {
      setLoadingBoards(true);
      try {
        const selectedProject = projects.find(p => p.id === projectId);
        const authData: AuthData = {
          jiraHost: formData.jiraHost,
          email: formData.email,
          jiraToken: formData.jiraToken
        };
        const boardsData = await ApiService.getBoards(authData, selectedProject?.key);
        const fetchedBoards = boardsData.boards || [];
        setBoards(fetchedBoards);
        
        // Auto-select board if there's only one
        if (fetchedBoards.length === 1) {
          const boardId = String(fetchedBoards[0].id);
          setFormData(prev => ({ ...prev, boardId }));
          // Also fetch sprints for the auto-selected board
          await handleBoardChange(boardId);
        }
      } catch (error) {
        showError(`Error fetching boards: ${(error as Error).message}`);
      } finally {
        setLoadingBoards(false);
      }
    }
  };

  const handleBoardChange = async (boardId: string) => {
    setFormData(prev => ({ ...prev, boardId, sprintId: '' }));
    setSprints([]);
    setSelectedSprintIds([]);
    
    if (boardId) {
      setLoadingSprints(true);
      try {
        const authData: AuthData = {
          jiraHost: formData.jiraHost,
          email: formData.email,
          jiraToken: formData.jiraToken
        };
        const sprintsData = await ApiService.getSprints(authData, boardId);
        setSprints(sprintsData.sprints || []);
      } catch (error) {
        showError(`Error fetching sprints: ${(error as Error).message}`);
      } finally {
        setLoadingSprints(false);
      }
    }
  };

  const handleSprintSelection = (sprintIds: string[]) => {
    setSelectedSprintIds(sprintIds);
  };

  const handleSprintChange = (event: any, newValue: Sprint | null) => {
    setFormData(prev => ({ ...prev, sprintId: newValue ? String(newValue.id) : '' }));
  };

  return {
    boards,
    sprints,
    selectedProjectId,
    selectedSprintIds,
    loadingBoards,
    loadingSprints,
    handleProjectChange,
    handleBoardChange,
    handleSprintSelection,
    handleSprintChange,
    setBoards,
    setSprints,
    setSelectedSprintIds
  };
}
