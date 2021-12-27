import React, { useRef, useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
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

  let height = ref.current?.offsetHeight ?? 0;
  let width = ref.current?.offsetWidth ?? 0;

  let rotatePos = { x: x + Math.floor(width / 2) - size / 2, y: y - padding / 2 - 30 };
  let rbPos = { x: x + width - size / 2 - padding / 2, y: y + height - size / 2 - padding / 2 };
  let rcPos = { x: x + width - size / 2 - padding / 2, y: y + Math.floor(height / 2) - size / 2 };
  let lcPos = { x: x - size / 2, y: y + Math.floor(height / 2) - size / 2 };
  let cbPos = { x: x + Math.floor(width / 2) - size / 2, y: y + height - size / 2 - padding / 2 };

  let curPos = { x: 0, y: 0 };
  let curRotate = 0;
  let curRotatePos = { x: 0, y: 0 };
  const x0 = x + w / 2;
  const y0 = y + h / 2;

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

  const onDragStartRotate = () => {
    curRotate = rotate;
    setShowRotate(true);
    // curRotatePos = pos
  };

  const onDragEndRotate = () => {
    setShowRotate(false);
  };

  const onDragRotate = (pos: DragItemType) => {
    const r = h / 2;
    // console.log([x0, y0], [rotatePos.x, rotatePos.y], [pos.x, pos.y]);
    const { x, y } = getPosition([x0, y0], [rotatePos.x, rotatePos.y], curRotate, true);
    // console.log({ x, y }, pos);
    const angle = getAngle([x0, y0], [x, y], [pos.x, pos.y], r);
    // console.log(angle);
    curRotate = curRotate + angle;
    onResize && onResize({ rotate: curRotate });
    // console.log(angle);
  };

  // console.log(getPosition([x0, y0], [rotatePos.x, rotatePos.y], rotate, true));

  return (
    <div>
      <children.type key={children.key} {...props} {...children.props} ref={ref}></children.type>
      {/* 旋转 */}
      {isSelected && (
        <Draggable
          // dragCursor="w-resize"
          // axis="x"
          maxX={x + w - minWidth}
          position={getPosition([x0, y0], [rotatePos.x, rotatePos.y], rotate, true)}
          onDrag={onDragRotate}
          onDragStart={onDragStartRotate}
          onDragEnd={onDragEndRotate}
        >
          <ReloadOutlined />
        </Draggable>
      )}
      {/* 左边拖动 */}
      {isSelected && (
        <Draggable
          dragCursor="w-resize"
          axis="x"
          maxX={x + w - minWidth}
          position={getPosition([x0, y0], [lcPos.x, lcPos.y], rotate, true)}
          onDrag={onDragLC}
          onDragStart={onDragStartLC}
        >
          <div
            style={{ width: size, height: size, background: '#000', borderRadius: '100%' }}
          ></div>
        </Draggable>
      )}
      {/* 右边拖动 */}
      {isSelected && (
        <Draggable
          dragCursor="e-resize"
          axis="x"
          minX={x + minWidth}
          position={getPosition([x0, y0], [rcPos.x, rcPos.y], rotate)}
          onDrag={onDrag}
        >
          <div
            style={{ width: size, height: size, background: '#000', borderRadius: '100%' }}
          ></div>
        </Draggable>
      )}
      {/* 右下角拖动 */}
      {isSelected && (
        <Draggable
          dragCursor="se-resize"
          minX={x + minWidth}
          minY={y + minHeight}
          position={getPosition([x0, y0], [rbPos.x, rbPos.y], rotate)}
          onDrag={onDrag}
        >
          <div
            style={{ width: size, height: size, background: '#000', borderRadius: '100%' }}
          ></div>
        </Draggable>
      )}
      {/* 下边拖动 */}
      {isSelected && (
        <Draggable
          axis="y"
          dragCursor="s-resize"
          minY={y + minHeight}
          position={getPosition([x0, y0], [cbPos.x, cbPos.y], rotate)}
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
      {!!isSelected && !!showRotate && (
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
