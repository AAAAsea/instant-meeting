export const qualities = {
  'h': {
    width: {
      max: 1920
    },
    height: {
      max: 1080
    }
  },
  's': {
    width: {
      max: 1280
    },
    height: {
      max: 720
    }
  },
  'm': {
    width: {
      max: 720
    },
    height: {
      max: 480
    }
  },
  'l': {
    width: {
      max: 480
    },
    height: {
      max: 360
    }
  },
  desc: {
    h: '原画',
    m: '高清',
    s: '标清',
    l: '流畅'
  }
}

export const recorderQualities = {
  3: {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 5000000
  },
  2: {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 3000000,
  },
  1: {
    audioBitsPerSecond: 64000,
    videoBitsPerSecond: 1000000
  }
}

export const stringToColor = (string) => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

let notification;
export function notify(name, msg) {
  if (notification)
    notification.close();
  const options = { icon: '/video.svg', body: `“${msg}”` };
  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    console.log("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    notification = new Notification(name + '：', options);
    // …
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        notification = new Notification(name, options);
        // …
      }
    });
  }
}

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

export const keyMap = {
  ArrowUp: 'up',
  ArrowDo: 'down',
  ArrowLe: 'right',
  ArrowRi: 'left',
  AudioVolumeMute: 'audio_mute',
  AudioVolumeDown: 'audio_vol_down',
  AudioVolumeUp: 'audio_vol_up',
  '': 'space'
}
