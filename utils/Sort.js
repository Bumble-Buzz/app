/**
 * a comes first: < 0
 * no change:     = 0
 * b comes first: > 0
**/

const ORDER = { ASCENDING: 'asc', DESCENDING: 'desc' };

const _getElements = (_elements) => {
  let elements = '';
  for (let i=0; i < _elements.length; i++) {
    elements += `['${_elements[i]}']`;
  }
  return elements;
};

const _doesArrayInclude = (_array, _identifier = {}) => {
  const match = _array.find((arrayElement) => {
      return _.isEqual(arrayElement, _identifier);
  });
  return match == undefined ? false : true;
};

const sortBoolean = (_data = [], comparator = []) => {
  return _data.sort((a, b) => {
    const aVal = _doesArrayInclude(comparator, a.id);
    const bVal = _doesArrayInclude(comparator, b.id);
    if (aVal === bVal) return 0;
    if (aVal === true) return -1;
    if (bVal === true) return 1;
  });
};

const _sortNumberAsc = (firstVal, secondVal) => firstVal - secondVal;
const _sortNumberDesc = (firstVal, secondVal) => secondVal - firstVal;

const sortNumber = (_data, _elements = [], order = 'asc') => {
  if (_elements.length <= 0) return _data;

  const elements = _getElements(_elements);
  return _data.sort((a, b) => {
    const firstVal = eval(`a${elements}`);
    const secondVal = eval(`b${elements}`);

    let compare;
    if (order === ORDER.ASCENDING) compare = _sortNumberAsc(firstVal, secondVal);
    if (order === ORDER.DESCENDING) compare = _sortNumberDesc(firstVal, secondVal);
    return compare;
  });
};

const _sortStringAsc = (firstVal, secondVal) => firstVal < secondVal
const _sortStringDesc = (firstVal, secondVal) => firstVal > secondVal;

const sortString = (_data, _elements = [], order = 'asc') => {
  if (_elements.length <= 0) return _data;

  const elements = _getElements(_elements);
  return _data.sort((a, b) => {
    const firstVal = eval(`a${elements}`);
    const secondVal = eval(`b${elements}`);

    let compare;
    if (order === ORDER.ASCENDING) compare = _sortStringAsc(firstVal, secondVal);
    if (order === ORDER.DESCENDING) compare = _sortStringDesc(firstVal, secondVal);
    if (compare) return -1;
    if (!compare) return 1;
    return 0;
  });
};


module.exports = {
  order: ORDER,
  sortBoolean,
  sortNumber,
  sortString
}