
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
    time: string;
    color: string;
    alarm: string;
    repeat: string;
    memo: string;
    completed: boolean;
  }) => ipcRenderer.invoke('schedules:update', schedule),

  toggleCompleted: (id: number, completed: boolean) =>
    ipcRenderer.invoke('schedules:toggle-completed', id, completed),
});

contextBridge.exposeInMainWorld('windowAPI', {
  getLocked: () => ipcRenderer.invoke('window:get-locked'),
  setLocked: (locked: boolean) =>
    ipcRenderer.invoke('window:set-locked', locked),
});
