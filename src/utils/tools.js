export function formatDate(time, format = 'YY-MM-DD hh:mm:ss') {
  const date = new Date(time);

  const year = date.getFullYear(),
    month = date.getMonth() + 1,//月份是从0开始的
    day = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes(),
    sec = date.getSeconds();
  const preArr = Array.apply(null, Array(10)).map(function (elem, index) {
    return '0' + index;
  });

  const newTime = format.replace(/YY/g, year)
    .replace(/MM/g, preArr[month] || month)
    .replace(/DD/g, preArr[day] || day)
    .replace(/hh/g, preArr[hour] || hour)
    .replace(/mm/g, preArr[min] || min)
    .replace(/ss/g, preArr[sec] || sec);

  return newTime;
}

function parseNum(num, decimal) {
  if (!decimal) decimal = 1;
  return Math.round(num * 10 ** decimal) / (10 ** decimal)
}
export function formatSize(size) {
  if (size < 1024)
    return ~~(size) + 'B'
  else if (size < 1024 * 1024)
    return ~~(size / 1024) + 'KB'
  else if (size < 1024 * 1024 * 1024)
    return parseNum(size / 1024 / 1024, 1) + 'M'
  else if (size < 1024 ** 4)
    return parseNum(size / 1024 / 1024 / 1024, 2) + 'G'
  else if (size < 1024 ** 5)
    return parseNum(size / 1024 / 1024 / 1024 / 1024, 2) + 'T'
}
