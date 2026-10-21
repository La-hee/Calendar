
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('holidayAPI', {
  getHolidays: (year: number, month: number) =>
    ipcRenderer.invoke('get-holidays', year, month),
});

contextBridge.exposeInMainWorld('scheduleAPI', {
  getAll: () => ipcRenderer.invoke('schedules:get-all'),

  add: (schedule: {
    title: string;
    date: string;
    endDate?: string;
    time?: string;
    color?: string;
    alarm?: string;
    repeat?: string;
    memo?: string;
    completed?: boolean;
  }) => ipcRenderer.invoke('schedules:add', schedule),

  update: (schedule: {
    id: number;
    title: string;
    date: string;
    endDate?: string;
    time: string;
    color: string;
    alarm: string;
    repeat: string;
    memo: string;
    completed: boolean;
  }) => ipcRenderer.invoke('schedules:update', schedule),

  remove: (id: number) =>
  ipcRenderer.invoke('schedules:delete', id),

  
  getOccurrenceCompletions: () =>
    ipcRenderer.invoke('schedules:get-occurrence-completions'),

  toggleOccurrenceCompleted: (
    id: number,
    date: string,
    completed: boolean,
  ) =>
    ipcRenderer.invoke(
      'schedules:toggle-occurrence-completed',
      id,
      date,
      completed,
    ),


  toggleCompleted: (id: number, completed: boolean) =>
    ipcRenderer.invoke('schedules:toggle-completed', id, completed),
});

contextBridge.exposeInMainWorld('windowAPI', {
  getLocked: () => ipcRenderer.invoke('window:get-locked'),
  setLocked: (locked: boolean) =>
    ipcRenderer.invoke('window:set-locked', locked),

   setEditing: (editing: boolean) =>
    ipcRenderer.invoke('window:set-editing', editing),
});
