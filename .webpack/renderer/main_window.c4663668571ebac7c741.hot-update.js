"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdatedal_calendar"]("main_window",{

/***/ "./src/preload.ts"
/*!************************!*\
  !*** ./src/preload.ts ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('holidayAPI', {\n    getHolidays: (year, month) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('get-holidays', year, month),\n});\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('scheduleAPI', {\n    getAll: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('schedules:get-all'),\n    add: (schedule) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('schedules:add', schedule),\n    update: (schedule) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('schedules:update', schedule),\n    toggleCompleted: (id, completed) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('schedules:toggle-completed', id, completed),\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcHJlbG9hZC50cyIsIm1hcHBpbmdzIjoiOzs7QUFDc0Q7QUFFdEQsbURBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUU7SUFDNUMsV0FBVyxFQUFFLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQzNDLGlEQUFXLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0NBQ2xELENBQUMsQ0FBQztBQUVILG1EQUFhLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFO0lBQzdDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxpREFBVyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztJQUVyRCxHQUFHLEVBQUUsQ0FBQyxRQVNMLEVBQUUsRUFBRSxDQUFDLGlEQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7SUFFbkQsTUFBTSxFQUFFLENBQUMsUUFVUixFQUFFLEVBQUUsQ0FBQyxpREFBVyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUM7SUFFdEQsZUFBZSxFQUFFLENBQUMsRUFBVSxFQUFFLFNBQWtCLEVBQUUsRUFBRSxDQUNsRCxpREFBVyxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDO0NBQ2xFLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2RhbC1jYWxlbmRhci8uL3NyYy9wcmVsb2FkLnRzPzA1NmEiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGNvbnRleHRCcmlkZ2UsIGlwY1JlbmRlcmVyIH0gZnJvbSAnZWxlY3Ryb24nO1xyXG5cclxuY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnaG9saWRheUFQSScsIHtcclxuICBnZXRIb2xpZGF5czogKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcikgPT5cclxuICAgIGlwY1JlbmRlcmVyLmludm9rZSgnZ2V0LWhvbGlkYXlzJywgeWVhciwgbW9udGgpLFxyXG59KTtcclxuXHJcbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ3NjaGVkdWxlQVBJJywge1xyXG4gIGdldEFsbDogKCkgPT4gaXBjUmVuZGVyZXIuaW52b2tlKCdzY2hlZHVsZXM6Z2V0LWFsbCcpLFxyXG5cclxuICBhZGQ6IChzY2hlZHVsZToge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIGRhdGU6IHN0cmluZztcclxuICAgIHRpbWU/OiBzdHJpbmc7XHJcbiAgICBjb2xvcj86IHN0cmluZztcclxuICAgIGFsYXJtPzogc3RyaW5nO1xyXG4gICAgcmVwZWF0Pzogc3RyaW5nO1xyXG4gICAgbWVtbz86IHN0cmluZztcclxuICAgIGNvbXBsZXRlZD86IGJvb2xlYW47XHJcbiAgfSkgPT4gaXBjUmVuZGVyZXIuaW52b2tlKCdzY2hlZHVsZXM6YWRkJywgc2NoZWR1bGUpLFxyXG5cclxuICB1cGRhdGU6IChzY2hlZHVsZToge1xyXG4gICAgaWQ6IG51bWJlcjtcclxuICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICBkYXRlOiBzdHJpbmc7XHJcbiAgICB0aW1lOiBzdHJpbmc7XHJcbiAgICBjb2xvcjogc3RyaW5nO1xyXG4gICAgYWxhcm06IHN0cmluZztcclxuICAgIHJlcGVhdDogc3RyaW5nO1xyXG4gICAgbWVtbzogc3RyaW5nO1xyXG4gICAgY29tcGxldGVkOiBib29sZWFuO1xyXG4gIH0pID0+IGlwY1JlbmRlcmVyLmludm9rZSgnc2NoZWR1bGVzOnVwZGF0ZScsIHNjaGVkdWxlKSxcclxuXHJcbiAgdG9nZ2xlQ29tcGxldGVkOiAoaWQ6IG51bWJlciwgY29tcGxldGVkOiBib29sZWFuKSA9PlxyXG4gICAgaXBjUmVuZGVyZXIuaW52b2tlKCdzY2hlZHVsZXM6dG9nZ2xlLWNvbXBsZXRlZCcsIGlkLCBjb21wbGV0ZWQpLFxyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/preload.ts\n\n}");

/***/ }

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ __webpack_require__.h = () => ("d18898446e2bcb086327");
/******/ 
/******/ }
);