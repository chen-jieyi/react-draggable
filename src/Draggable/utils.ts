export let padding = 3;

export const onFocus = (ref?: React.MutableRefObject<any>) => {
  if (!ref?.current) return;
  let esrc = ref.current;

  let range = document.createRange();

  range.selectNodeContents(esrc);

  range.collapse(false);

  let sel = window.getSelection();

  sel?.removeAllRanges();

  sel?.addRange(range);
};

export const getAngle = (
  [x0, y0]: [number, number],
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
  r: number,
): number => {
  // console.log(x1 - x0, y1 - y0);
  // console.log(x2, x1, x0);
  // console.log(y2, y1, y0);
  let direction = (x1 - x0) * (y2 - y1) - (y1 - y0) * (x2 - x1) >= 0 ? 1 : -1;

  let AB = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
  let AC = Math.sqrt(Math.pow(x0 - x2, 2) + Math.pow(y0 - y2, 2));
  let BC = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  let cosA = (Math.pow(AB, 2) + Math.pow(AC, 2) - Math.pow(BC, 2)) / (2 * AB * AC);
  let angleA = Math.ceil((Math.acos(cosA) * 180) / (Math.PI * r));
  // console.log((Math.acos(cosA) * 180) / (Math.PI * r), angleA);
  return angleA * direction;
};

export const getPosition = (
  [x0, y0]: [number, number],
  [x1, y1]: [number, number],
  angle: number,
  isLeft?: boolean,
) => {
  // console.log(a, b);
  let r = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));

  // let AC = Math.sqrt(Math.pow(x0 - y, 2))
  let x = x0 + r * Math.sin(Math.asin((x1 - x0) / r) - (angle * Math.PI) / 180);
  let y = y0 + r * Math.cos(Math.acos((y1 - y0) / r) - (angle * Math.PI) / 180);

  if (isLeft) {
    x = Math.floor(x0 + r * Math.cos(Math.acos((x1 - x0) / r) - (angle * Math.PI) / 180));
    y = Math.floor(y0 + r * Math.sin(Math.asin((y1 - y0) / r) - (angle * Math.PI) / 180));
  }

  // console.log(x, y);
  return { x, y };
};
