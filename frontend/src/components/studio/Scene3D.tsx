import { useRef, useState } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Grid, OrbitControls, TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { LayoutItem } from '../../types';
import { clampAndSnap, collisionIds, layout2DTo3D, layout3DTo2D } from '../../utils/layout3d';

interface Scene3DProps {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  items: LayoutItem[];
  selectedItemId: string | null;
  activeTool: 'select' | 'move' | 'rotate' | 'delete' | 'zoom';
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<LayoutItem>) => void;
  presentMode?: boolean;
}

const materialColor = (item: LayoutItem) =>
  item.customizations?.colorHex ||
  (item.category?.toLowerCase().includes('bed')
    ? '#8B6914'
    : item.category?.toLowerCase().includes('sofa')
      ? '#5C574E'
      : item.category?.toLowerCase().includes('wardrobe')
        ? '#5C4033'
        : '#78655a');

function FurnitureMesh({ item, height, invalid, selected }: { item: LayoutItem; height: number; invalid: boolean; selected: boolean }) {
  const color = invalid ? '#dc2626' : materialColor(item);
  const cat = `${item.category || ''} ${item.name}`.toLowerCase();
  const mat = <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} emissive={selected ? '#2C4A3E' : '#000'} emissiveIntensity={selected ? 0.2 : 0} />;

  if (cat.includes('bed')) {
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, height * 0.28, 0]}>
          <boxGeometry args={[item.widthFt, height * 0.55, item.heightFt]} />
          {mat}
        </mesh>
        <mesh castShadow position={[0, height * 0.72, -item.heightFt * 0.35]}>
          <boxGeometry args={[item.widthFt * 0.95, height * 0.45, item.heightFt * 0.22]} />
          {mat}
        </mesh>
      </group>
    );
  }

  if (cat.includes('sofa')) {
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, height * 0.28, 0]}>
          <boxGeometry args={[item.widthFt, height * 0.45, item.heightFt * 0.85]} />
          {mat}
        </mesh>
        <mesh castShadow position={[0, height * 0.55, -item.heightFt * 0.32]}>
          <boxGeometry args={[item.widthFt, height * 0.55, item.heightFt * 0.2]} />
          {mat}
        </mesh>
        <mesh castShadow position={[-item.widthFt * 0.42, height * 0.45, 0]}>
          <boxGeometry args={[item.widthFt * 0.12, height * 0.4, item.heightFt * 0.8]} />
          {mat}
        </mesh>
        <mesh castShadow position={[item.widthFt * 0.42, height * 0.45, 0]}>
          <boxGeometry args={[item.widthFt * 0.12, height * 0.4, item.heightFt * 0.8]} />
          {mat}
        </mesh>
      </group>
    );
  }

  if (cat.includes('wardrobe') || cat.includes('cabinet')) {
    return (
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[item.widthFt, height, item.heightFt]} />
          {mat}
        </mesh>
        <mesh position={[0, 0, item.heightFt / 2 + 0.01]}>
          <boxGeometry args={[0.04, height * 0.85, 0.02]} />
          <meshStandardMaterial color="#C9B8A0" metalness={0.4} />
        </mesh>
      </group>
    );
  }

  if (cat.includes('door')) {
    return (
      <mesh castShadow>
        <boxGeometry args={[item.widthFt, height, Math.max(0.12, item.heightFt)]} />
        <meshStandardMaterial color="#6B5344" roughness={0.7} />
      </mesh>
    );
  }

  if (cat.includes('window')) {
    return (
      <mesh>
        <boxGeometry args={[item.widthFt, Math.min(height, 4), Math.max(0.1, item.heightFt)]} />
        <meshStandardMaterial color="#A8C5D4" transparent opacity={0.55} roughness={0.2} metalness={0.1} />
      </mesh>
    );
  }

  if (cat.includes('table') || cat.includes('desk') || cat.includes('tv')) {
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, height * 0.85, 0]}>
          <boxGeometry args={[item.widthFt, height * 0.12, item.heightFt]} />
          {mat}
        </mesh>
        {[
          [-0.4, -0.4],
          [0.4, -0.4],
          [-0.4, 0.4],
          [0.4, 0.4],
        ].map(([lx, lz], i) => (
          <mesh key={i} castShadow position={[item.widthFt * lx * 0.45, height * 0.4, item.heightFt * lz * 0.45]}>
            <boxGeometry args={[0.12, height * 0.75, 0.12]} />
            {mat}
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[item.widthFt, height, item.heightFt]} />
      {mat}
    </mesh>
  );
}

function Furniture({
  item,
  selected,
  invalid,
  room,
  onSelect,
  onUpdate,
  setOrbitDragging,
}: {
  item: LayoutItem;
  selected: boolean;
  invalid: boolean;
  room: Scene3DProps;
  onSelect: (id: string) => void;
  onUpdate: Scene3DProps['onUpdate'];
  setOrbitDragging: (v: boolean) => void;
}) {
  const group = useRef<Group>(null!);
  const [pointerDrag, setPointerDrag] = useState(false);
  const height = item.verticalHeightFt || 2.5;
  const position = layout2DTo3D(item);
  const commit = (worldX: number, worldZ: number) => {
    const next = layout3DTo2D(worldX, worldZ, item);
    onUpdate(item.id, clampAndSnap(item, next.x, next.y, room.lengthFt, room.widthFt));
  };
  const select = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(item.id);
  };
  const moveOnFloor = (e: ThreeEvent<PointerEvent>) => {
    if (pointerDrag) {
      e.stopPropagation();
      commit(e.point.x, e.point.z);
    }
  };

  const content = (
    <group
      ref={group}
      position={[position.x, position.y, position.z]}
      rotation={[0, (-item.rotation * Math.PI) / 180, 0]}
      onClick={select}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(item.id);
        setPointerDrag(true);
        setOrbitDragging(true);
      }}
      onPointerMove={moveOnFloor}
      onPointerUp={(e) => {
        e.stopPropagation();
        setPointerDrag(false);
        setOrbitDragging(false);
      }}
    >
      <FurnitureMesh item={item} height={height} invalid={invalid} selected={selected} />
      {selected && (
        <mesh>
          <boxGeometry args={[item.widthFt + 0.12, height + 0.12, item.heightFt + 0.12]} />
          <meshBasicMaterial color={invalid ? '#ef4444' : '#2C4A3E'} wireframe />
        </mesh>
      )}
    </group>
  );

  return selected && room.activeTool !== 'delete' && !room.presentMode ? (
    <TransformControls
      mode={room.activeTool === 'rotate' ? 'rotate' : 'translate'}
      object={group}
      showY={false}
      onMouseDown={() => setOrbitDragging(true)}
      onMouseUp={() => {
        setOrbitDragging(false);
        if (group.current) {
          if (room.activeTool === 'rotate') onUpdate(item.id, { rotation: (-group.current.rotation.y * 180) / Math.PI });
          else commit(group.current.position.x, group.current.position.z);
        }
      }}
      onObjectChange={() => {
        if (group.current) group.current.position.y = height / 2;
      }}
    >
      {content}
    </TransformControls>
  ) : (
    content
  );
}

function RoomShell({
  lengthFt,
  widthFt,
  heightFt,
  items,
}: Pick<Scene3DProps, 'lengthFt' | 'widthFt' | 'heightFt' | 'items'>) {
  const wall = <meshStandardMaterial color="#e9e2d8" roughness={0.92} />;
  const doors = items.filter((i) => /door/i.test(`${i.category} ${i.name}`));

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lengthFt / 2, 0, widthFt / 2]} receiveShadow>
        <planeGeometry args={[lengthFt, widthFt]} />
        <meshStandardMaterial color="#C9B8A0" roughness={0.85} />
      </mesh>
      <mesh position={[lengthFt / 2, heightFt / 2, 0]}>
        <boxGeometry args={[lengthFt, heightFt, 0.15]} />
        {wall}
      </mesh>
      <mesh position={[0, heightFt / 2, widthFt / 2]}>
        <boxGeometry args={[0.15, heightFt, widthFt]} />
        {wall}
      </mesh>
      {/* Door openings as darker insets on left wall */}
      {doors.map((d) => (
        <mesh key={`opening-${d.id}`} position={[0.08, (d.verticalHeightFt || 7) / 2, d.y + d.heightFt / 2]}>
          <boxGeometry args={[0.05, d.verticalHeightFt || 7, Math.max(d.widthFt, 2.5)]} />
          <meshStandardMaterial color="#3A322C" />
        </mesh>
      ))}
    </>
  );
}

export function Scene3D(props: Scene3DProps) {
  const [orbitDragging, setOrbitDragging] = useState(false);
  const invalid = collisionIds(props.items);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1A1814]">
      <Canvas
        shadows
        camera={{ position: [props.lengthFt * 1.05, props.heightFt * 1.1, props.widthFt * 1.3], fov: 46 }}
        onPointerMissed={() => props.onSelect('')}
      >
        <color attach="background" args={['#1F1C19']} />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[props.lengthFt / 2, props.heightFt * 1.2, props.widthFt / 3]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[props.lengthFt * 0.8, props.heightFt * 0.9, props.widthFt * 0.8]} intensity={0.35} color="#E8D5C0" />
        <RoomShell {...props} />
        {props.items.map((item) => (
          <Furniture
            key={item.id}
            item={item}
            selected={item.id === props.selectedItemId}
            invalid={invalid.has(item.id)}
            room={props}
            onSelect={props.onSelect}
            onUpdate={props.onUpdate}
            setOrbitDragging={setOrbitDragging}
          />
        ))}
        {!props.presentMode && (
          <Grid
            args={[props.lengthFt * 2, props.widthFt * 2]}
            position={[props.lengthFt / 2, 0.01, props.widthFt / 2]}
            cellSize={1}
            cellColor="#5d6877"
            sectionSize={5}
            sectionColor="#8994a5"
          />
        )}
        <OrbitControls
          makeDefault
          enabled={!orbitDragging}
          target={[props.lengthFt / 2, 2, props.widthFt / 2]}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
      {!props.presentMode && (
        <div className="absolute left-3 top-3 border border-white/15 bg-ink/75 px-2.5 py-1.5 text-[10px] font-medium text-[#F7F6F2]">
          Click to select · {props.activeTool === 'rotate' ? 'use ring to rotate' : 'drag to move'} · red = collision
        </div>
      )}
    </div>
  );
}
