
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('holidayAPI', {
  getHolidays: (year: number, month: number) =>
    ipcRenderer.invoke('get-holidays', year, month),
});
