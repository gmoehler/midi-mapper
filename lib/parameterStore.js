// value for a parameter 
// there are potentially 4 parameters per strip / layer

const parameterValue = [];

function parameterId2Index(paramId) {
  return JSON.stringify(paramId);
}

function setParameterValue(paramId, newParamValue, updateFunctions) {
  const idx = parameterId2Index(paramId);
  if (parameterValue[idx] !== newParamValue) {
    parameterValue[idx] = newParamValue;
    updateFunctions.forEach((func) =>
      func(paramId, newParamValue))
  }
}

function clearParameterValue(paramId, updateFunctions) {
  setParameterValue(paramId, 0, updateFunctions);
}

function getParameterValue(paramId) {
  const idx = parameterId2Index(paramId);
  return parameterValue[idx] || 0;
}

module.exports = {
  getParameterValue,
  setParameterValue,
  clearParameterValue,
}