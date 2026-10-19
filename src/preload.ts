//oxlint-disable eslint-plugin-unicorn/no-empty-file
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('holidayAPI', {
  getHolidays: (year: number, month: number) =>
    ipcRenderer.invoke('get-holidays', year, month),
});
