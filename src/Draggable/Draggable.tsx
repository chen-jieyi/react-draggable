import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';

let prevPos = { x: 0, y: 0 };
let curPos = { y: 0, x: 0 };

export interface DragItemType {
  x: number;
  y: number;
  height?: number;
  width?: number;
}

export interface DraggableProps {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactElement;
  defaultPosition?: { x: number; y: number };
  position?: { x: number; y: number };
  axis?: 'x' | 'y' | 'xy';
  rotate?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  dbCursor?: string; // 双击鼠标样式
  dragCursor?: string; // 拖动样式
  isMult?: boolean; // 是否多选
  isSelected?: boolean; // 是否被选中
  isForbid?: boolean;
  allClear?: string;
  selectedKey?: string;
  toolRender?: (isSelected?: boolean) => React.ReactElement;
  onDrag?: (values: { x: number; y: number; moveW: number; moveH: number }) => void;
  onDragStart?: (e: MouseEvent | React.MouseEvent, item?: DragItemType) => void;
  onDragEnd?: (e: MouseEvent | React.MouseEvent, item?: DragItemType) => void;
  onDoubleClick?: (ref?: React.MutableRefObject<any>) => void;
  onClear?: () => void;
}

const Draggable: React.ForwardRefRenderFunction<unknown, DraggableProps> = (
  {
    style,
    className,
    defaultPosition = { x: 0, y: 0 },
    position,
    axis = 'xy',
    rotate = 0,
    minX,
    maxX,
    minY,
    maxY,
    children,
    dbCursor,
    dragCursor,
    isMult,
    isSelected,
    isForbid = false, // 是否可操作
    allClear,
    selectedKey,
    toolRender,
    onDrag,
    onDragStart,
    onDragEnd,
    onDoubleClick,
    onClear,
  },
  dragRef,
) => {
  // console.log(isSelected);
  // console.log(dragRef);
  let isMove = false;

  const dRef = useRef(null);
  const ref = useRef<{ offsetHeight: number; offsetWidth: number }>(null);
  const [cursor, setCursor] = useState(dragCursor ?? 'move');
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useImperativeHandle(dragRef, () => dRef?.current);

  useEffect(() => {
    setPos(defaultPosition);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    onDragStart &&
      onDragStart(e, {
        height: ref?.current?.offsetHeight,
        width: ref?.current?.offsetWidth,
        ...defaultPosition,
      });
    // 当选择拖动对象时 当前的光标失去焦点禁止输入
    window?.getSelection()?.removeAllRanges();

    if (isForbid) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    prevPos = {
      y: e.nativeEvent.y,
      x: e.nativeEvent.x,
    };
    curPos = {
      ...(position || pos),
    };
    isMove = true;
    window.onmousemove = onMouseMove;
    window.onmouseup = onMouseUp;
  };

  // 按下移动鼠标
  const onMouseMove = (e: MouseEvent) => {
    // console.log(isMult);
    // console.log(isMove, isMult);
    if (!isMove) return;
    if (isMult) return;

    let x = axis !== 'y' ? curPos.x + e.x - prevPos.x : curPos.x;
    let y = axis !== 'x' ? curPos.y + e.y - prevPos.y : curPos.y;
    // 边界限制
    minX && x < minX && (x = minX);
    maxX && x > maxX && (x = maxX);
    minY && y < minY && (y = minY);
    maxY && y > maxY && (y = maxY);

    let moveW = x - curPos.x;
    let moveH = y - curPos.y;

    curPos = {
      y,
      x,
    };
    prevPos = {
      y: e.y,
      x: e.x,
    };
    onDrag && onDrag({ ...curPos, moveW, moveH });
    setPos(curPos);
    onClear && onClear();
  };

  // 松开鼠标
  const onMouseUp = (e: MouseEvent) => {
    // console.log(isMult);
    onDragEnd &&
      onDragEnd(e, {
        height: ref?.current?.offsetHeight,
        width: ref?.current?.offsetWidth,
        ...curPos,
      });
    isMove = false;

    prevPos = { x: 0, y: 0 };
    curPos = { y: 0, x: 0 };
    window.onmousemove = null;
    window.onmouseup = null;
  };

  // 双击聚焦文本输入
  const onDdClick = () => {
    // console.log(isForbid);
    if (!ref?.current) return;
    if (isForbid) return;
    onDoubleClick && onDoubleClick(ref);
    dbCursor && setCursor(dbCursor);
  };

  const onBlur = (e: React.FocusEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // console.log('blur');
    setCursor(dragCursor ?? 'move');
    // setMoving(false);
  };
  // console.log(dragCursor);
  return (
    <div
      ref={dRef}
      style={{
        position: 'absolute',
        top: (position || pos).y,
        left: (position || pos).x,
        border: isSelected
          ? isForbid
            ? '1px dashed #d9d5d5'
            : '1px dashed #685e5e'
          : '1px solid rgba(0,0,0,0)',
        cursor,
        overflow: 'hidden',
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
      className={className ?? ''}
      onMouseDown={onMouseDown}
      onDoubleClick={onDdClick}
      onBlur={onBlur}
    >
      {toolRender && toolRender(isSelected)}
      <children.type
        ref={ref}
        disabled={!isSelected}
        {...children.props}
        allClear={allClear}
        selectedKey={selectedKey}
      />

      {children?.props?.style?.position &&
        ['fixed', 'absolute'].includes(children?.props?.style?.position) && (
          <children.type
            {...children.props}
            style={{ ...(children?.props?.style || {}), position: undefined, visibility: 'hidden' }}
          />
        )}
    </div>
  );
};

export default forwardRef(Draggable);
