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

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n//oxlint-disable eslint-plugin-unicorn/no-empty-file\n// See the Electron documentation for details on how to use preload scripts:\n// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts\n\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('holidayAPI', {\n    getHolidays: (year, month) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('get-holidays', year, month),\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcHJlbG9hZC50cyIsIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBb0Q7QUFDcEQsNEVBQTRFO0FBQzVFLGdGQUFnRjtBQUcxQjtBQUV0RCxtREFBYSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRTtJQUM1QyxXQUFXLEVBQUUsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLEVBQUUsQ0FDM0MsaURBQVcsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7Q0FDbEQsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGFsLWNhbGVuZGFyLy4vc3JjL3ByZWxvYWQudHM/MDU2YSJdLCJzb3VyY2VzQ29udGVudCI6WyIvL294bGludC1kaXNhYmxlIGVzbGludC1wbHVnaW4tdW5pY29ybi9uby1lbXB0eS1maWxlXG4vLyBTZWUgdGhlIEVsZWN0cm9uIGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMgb24gaG93IHRvIHVzZSBwcmVsb2FkIHNjcmlwdHM6XG4vLyBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC90dXRvcmlhbC9wcm9jZXNzLW1vZGVsI3ByZWxvYWQtc2NyaXB0c1xuXG5cbmltcG9ydCB7IGNvbnRleHRCcmlkZ2UsIGlwY1JlbmRlcmVyIH0gZnJvbSAnZWxlY3Ryb24nO1xuXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdob2xpZGF5QVBJJywge1xuICBnZXRIb2xpZGF5czogKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcikgPT5cbiAgICBpcGNSZW5kZXJlci5pbnZva2UoJ2dldC1ob2xpZGF5cycsIHllYXIsIG1vbnRoKSxcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/preload.ts\n\n}");

/***/ },

/***/ "electron"
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
(module) {

module.exports = require("electron");

/***/ }

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ __webpack_require__.h = () => ("e121359a9498954c20dd");
/******/ 
/******/ }
);