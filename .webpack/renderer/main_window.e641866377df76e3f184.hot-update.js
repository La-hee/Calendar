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

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('holidayAPI', {\n    getHolidays: (year, month) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('get-holidays', year, month),\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcHJlbG9hZC50cyIsIm1hcHBpbmdzIjoiOzs7QUFDc0Q7QUFFdEQsbURBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUU7SUFDNUMsV0FBVyxFQUFFLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQzNDLGlEQUFXLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0NBQ2xELENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2RhbC1jYWxlbmRhci8uL3NyYy9wcmVsb2FkLnRzPzA1NmEiXSwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBjb250ZXh0QnJpZGdlLCBpcGNSZW5kZXJlciB9IGZyb20gJ2VsZWN0cm9uJztcblxuY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnaG9saWRheUFQSScsIHtcbiAgZ2V0SG9saWRheXM6ICh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpID0+XG4gICAgaXBjUmVuZGVyZXIuaW52b2tlKCdnZXQtaG9saWRheXMnLCB5ZWFyLCBtb250aCksXG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/preload.ts\n\n}");

/***/ }

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ __webpack_require__.h = () => ("8c38ada58449dc975ed3");
/******/ 
/******/ }
);