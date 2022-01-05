import React, { useRef, useState } from 'react';
import { ReloadOutlined, LockOutlined } from '@ant-design/icons';
import Draggable, { DraggableProps } from './Draggable';
import { padding, getAngle, getPosition } from './utils';

// import rb from './assets/arrawsalt.png';

// import styles from './Transform.less';

let size = 6;

interface DragItemType {
  x: number;
  y: number;
  moveW: number;
  moveH: number;
}

interface TransformProps extends Pick<DraggableProps, 'isSelected'> {
  children: React.ReactElement;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  isMult?: boolean;
  isHideRotateY?: boolean;
  onResize?: (values: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    rotate?: number;
  }) => void;
}

const Transform: React.FC<TransformProps> = ({
  children,
  minWidth = 10,
  minHeight = 10,
  isHideRotateY,
  onResize,
  ...props
}) => {
  const ref = useRef<{ offsetHeight: number; offsetWidth: number }>(null);

  const [showRotate, setShowRotate] = useState(false);

  const { isSelected } = props;
  const { x, y } = children.props.position;
  const w = children.props.width;
  const h = children.props.height;
  const rotate = children.props.rotate;

  let height = ref.current?.offsetHeight ?? 0 + 2;
  let width = ref.current?.offsetWidth ?? 0 + 2;

  let rotatePos = { x: x + width / 2 - 10, y: y - 30 };
  let rbPos = { x: x + width - size / 2, y: y + height - size / 2 };
  let rcPos = { x: x + width - size / 2, y: y + height / 2 - size / 2 };
  let lcPos = { x: x - size / 2, y: y + height / 2 - size / 2 };
  let cbPos = { x: x + width / 2 - size / 2, y: y + height - size / 2 };

  let curPos = { x: 0, y: 0 };
  let curRotate = 0;
  let clickRotate = 0;
  let rotateStartPos = { x: 0, y: 0 };
  // let curRotatePos = { x: 0, y: 0 };
  const x0 = x + w / 2;
  const y0 = y + height / 2;

  // 左边拖动点击开始时触发，用于设置左边拖动坐标的初始值
  const onDragStartLC = () => {
    curPos = { x, y };
  };

  // 拖动左边时触发 用于改变拖动对象的大小及位置
  const onDragLC = ({ moveW, moveH }: DragItemType) => {
    curPos = {
      x: curPos.x + moveW,
      y: curPos.y,
    };
    onResize &&
      onResize({
        ...curPos,
        width: -moveW + (ref.current?.offsetWidth ?? 0) - 2,
        height: -moveH + (ref.current?.offsetHeight ?? 0) - 2,
      });
  };

  // 右边、右下角、下边拖动触发
  const onDrag = ({ moveW, moveH }: DragItemType) => {
    onResize &&
      onResize({
        width: moveW + (ref.current?.offsetWidth ?? 0) - 2, // 2 是选择宽的边宽1*2
        height: moveH + (ref.current?.offsetHeight ?? 0) - 2, // 2 是选择宽的边宽1*2
      });
  };

  const onDragStartRotate = (
    e: React.MouseEvent | MouseEvent,
    items?: { x: number; y?: number },
  ) => {
    // console.log('start', rotate);
    // console.log(e, a);
    curRotate = rotate;
    clickRotate = rotate;
    rotateStartPos = { x: items?.x || 0, y: items?.y || 0 };
    setShowRotate(true);
    // curRotatePos = pos
  };

  const onDragRotate = (pos: DragItemType) => {
    const angle = getAngle(
      [x0, y0],
      [rotateStartPos.x + 10, rotateStartPos.y + 10],
      [pos.x + 10, pos.y + 10],
    );
    // console.log('angle', angle);
    curRotate = clickRotate + angle;
    onResize && onResize({ rotate: curRotate });
    // console.log(angle);
  };

  const onDragEndRotate = () => {
    setShowRotate(false);
  };

  const rPos = getPosition([x0, y0], [rotatePos.x + 10, rotatePos.y + 10], rotate, true);
  const lcRotatePos = getPosition([x0, y0], [lcPos.x + size / 2, lcPos.y + size / 2], rotate, true);
  const rcRotatePos = getPosition([x0, y0], [rcPos.x + size / 2, rcPos.y + size / 2], rotate);
  const rbRotatepos = getPosition([x0, y0], [rbPos.x + size / 2, rbPos.y + size / 2], rotate);
  const cbRotatePos = getPosition([x0, y0], [cbPos.x + size / 2, cbPos.y + size / 2], rotate);
  return (
    <div>
      <children.type key={children.key} {...props} {...children.props} ref={ref}></children.type>
      {isSelected && !!children.props.isLock && (
        <span
          style={{
            position: 'absolute',
            display: 'flex',
            color: '#fff',
            background: 'orange',
            borderRadius: '100%',
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            left: rPos.x - 10,
            top: rPos.y - 10,
            transform: `rotate(${rotate}deg)`,
          }}
        >
          <LockOutlined />
        </span>
      )}
      {/* 旋转 */}
      {isSelected && !props.isMult && !children.props.isLock && (
        <Draggable
          // dragCursor="w-resize"
          // axis="x"
          style={{
            display: 'flex',
            color: '#fff',
            background: '#333',
            borderRadius: '100%',
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          maxX={x + w - minWidth}
          position={{
            x: rPos.x - 10,
            y: rPos.y - 10,
          }}
          onDrag={onDragRotate}
          onDragStart={onDragStartRotate}
          onDragEnd={onDragEndRotate}
        >
          <ReloadOutlined style={{ transform: `rotate(${rotate}deg)` }} />
        </Draggable>
      )}
      {/* 左边拖动 */}
      {isSelected && !props.isMult && !children.props.isLock && (
        <Draggable
          dragCursor="w-resize"
          axis="x"
          maxX={x + w - minWidth}
          position={{
            x: lcRotatePos.x - size / 2,
            y: lcRotatePos.y - size / 2,
          }}
          onDrag={onDragLC}
          onDragStart={onDragStartLC}
        >
          <div
            style={{ width: size, height: size, background: '#000', borderRadius: '100%' }}
          ></div>
        </Draggable>
      )}
      {/* 右边拖动 */}
      {isSelected && !props.isMult && !children.props.isLock && (
        <Draggable
          dragCursor="e-resize"
          axis="x"
          minX={x + minWidth}
          position={{
            x: rcRotatePos.x - size / 2,
            y: rcRotatePos.y - size / 2,
          }}
          onDrag={onDrag}
        >
          <div
            style={{ width: size, height: size, background: '#000', borderRadius: '100%' }}
          ></div>
        </Draggable>
      )}
      {/* 右下角拖动 */}
      {isSelected && !isHideRotateY && !props.isMult && !children.props.isLock && (
        <Draggable
          dragCursor="se-resize"
          minX={x + minWidth}
          minY={y + minHeight}
          position={{
            x: rbRotatepos.x - size / 2,
            y: rbRotatepos.y - size / 2,
          }}
          onDrag={onDrag}
        >
          <div
            style={{ width: size, height: size, background: '#000', borderRadius: '100%' }}
          ></div>
        </Draggable>
      )}
      {/* 下边拖动 */}
      {isSelected && !isHideRotateY && !props.isMult && !children.props.isLock && (
        <Draggable
          axis="y"
          dragCursor="s-resize"
          minY={y + minHeight}
          position={{
            x: cbRotatePos.x - size / 2,
            y: cbRotatePos.y - size / 2,
          }}
          onDrag={onDrag}
        >
          <div
            style={{
              width: size,
              height: size,
              background: '#000',
              borderRadius: '100%',
            }}
          ></div>
        </Draggable>
      )}
      {!!isSelected && !!showRotate && !props.isMult && !children.props.isLock && (
        <span
          style={{
            position: 'absolute',
            display: 'inline-block',
            left: rotatePos.x + 40,
            top: rotatePos.y - 30,
            fontSize: 12,
            background: '#fff',
            border: '1px solid #333',
            padding: '3px 8px',
            borderRadius: '20px',
          }}
        >
          {rotate % 360} deg
        </span>
      )}
    </div>
  );
};

export default Transform;
