import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, RotateCcw, Palette, Layers, Sparkles, Eye, VolumeX, Volume2 } from 'lucide-react';

interface VisualizationNode {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  connections: string[];
  importance: number;
  category: string;
}

interface ImmersiveVisualizationProps {
  content: string;
  isActive: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const ImmersiveVisualization: React.FC<ImmersiveVisualizationProps> = ({
  content,
  isActive,
  onClose,
  theme
}) => {
  const [nodes, setNodes] = useState<VisualizationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VisualizationNode | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'3d' | 'network' | 'timeline' | 'mindmap'>('3d');
  const [isRotating, setIsRotating] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [colorScheme, setColorScheme] = useState<'semantic' | 'importance' | 'category'>('semantic');
  const [ambientSound, setAmbientSound] = useState(false);
  const [particleEffects, setParticleEffects] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef({ x: 0, y: 0 });

  // Extract and process content into visualization nodes
  useEffect(() => {
    if (!content) return;

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keywords = extractKeywords(content);
    const concepts = extractConcepts(sentences);
    
    const newNodes: VisualizationNode[] = concepts.map((concept, index) => ({
      id: `node-${index}`,
      text: concept.text,
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: (Math.random() - 0.5) * 1000,
      size: Math.max(20, concept.importance * 50),
      color: getNodeColor(concept.category, colorScheme),
      connections: findConnections(concept, concepts),
      importance: concept.importance,
      category: concept.category
    }));

    setNodes(newNodes);
  }, [content, colorScheme]);

  // Animation loop
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isRotating) {
        rotationRef.current.y += 0.01;
      }

      drawVisualization(ctx, canvas);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, nodes, visualizationMode, showConnections, isRotating, particleEffects]);

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  };

  const extractConcepts = (sentences: string[]) => {
    return sentences.map((sentence, index) => {
      const words = sentence.split(' ').length;
      const importance = Math.min(words / 20, 1);
      const category = categorizeText(sentence);
      
      return {
        text: sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : ''),
        importance,
        category,
        index
      };
    }).filter(concept => concept.importance > 0.2);
  };

  const categorizeText = (text: string): string => {
    const categories = {
      'concept': ['concept', 'idea', 'theory', 'principle', 'notion'],
      'action': ['do', 'make', 'create', 'build', 'develop', 'implement'],
      'emotion': ['feel', 'emotion', 'happy', 'sad', 'excited', 'worried'],
      'time': ['when', 'time', 'moment', 'period', 'duration', 'schedule'],
      'place': ['where', 'location', 'place', 'area', 'region', 'space'],
      'person': ['who', 'person', 'people', 'individual', 'character', 'author']
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  };

  const findConnections = (concept: any, allConcepts: any[]): string[] => {
    const connections: string[] = [];
    const conceptWords = concept.text.toLowerCase().split(' ');
    
    allConcepts.forEach((other, index) => {
      if (other.index === concept.index) return;
      
      const otherWords = other.text.toLowerCase().split(' ');
      const commonWords = conceptWords.filter(word => 
        otherWords.includes(word) && word.length > 4
      );
      
      if (commonWords.length > 1 || other.category === concept.category) {
        connections.push(`node-${index}`);
      }
    });
    
    return connections.slice(0, 3); // Limit connections to avoid clutter
  };

  const getNodeColor = (category: string, scheme: string): string => {
    if (scheme === 'semantic') {
      const colors = {
        'concept': '#3B82F6',
        'action': '#EF4444',
        'emotion': '#F59E0B',
        'time': '#10B981',
        'place': '#8B5CF6',
        'person': '#F97316',
        'general': '#6B7280'
      };
      return colors[category as keyof typeof colors] || colors.general;
    } else if (scheme === 'importance') {
      return `hsl(${120 - (1 - nodes.find(n => n.category === category)?.importance || 0) * 120}, 70%, 50%)`;
    } else {
      const hue = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
      return `hsl(${hue}, 70%, 50%)`;
    }
  };

  const drawVisualization = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw background effects
    if (particleEffects) {
      drawParticles(ctx, canvas);
    }

    // Draw connections first
    if (showConnections) {
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      
      nodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const connectedNode = nodes.find(n => n.id === connectionId);
          if (connectedNode) {
            const startPos = project3D(node, centerX, centerY);
            const endPos = project3D(connectedNode, centerX, centerY);
            
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(endPos.x, endPos.y);
            ctx.stroke();
          }
        });
      });
    }

    // Draw nodes
    nodes.forEach(node => {
      const pos = project3D(node, centerX, centerY);
      const scale = (1000 + node.z) / 2000; // Perspective scaling
      const size = node.size * scale;

      // Node shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(pos.x + 2, pos.y + 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Node body
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000';
      ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;
      ctx.stroke();

      // Node text (for larger nodes)
      if (size > 30) {
        ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
        ctx.font = `${Math.min(size / 4, 12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const maxWidth = size;
        const text = node.text.length > 20 ? node.text.substring(0, 20) + '...' : node.text;
        ctx.fillText(text, pos.x, pos.y, maxWidth);
      }
    });

    // Draw selected node info
    if (selectedNode) {
      drawNodeInfo(ctx, canvas, selectedNode);
    }
  };

  const project3D = (node: VisualizationNode, centerX: number, centerY: number) => {
    const cos = Math.cos(rotationRef.current.y);
    const sin = Math.sin(rotationRef.current.y);
    
    const rotatedX = node.x * cos - node.z * sin;
    const rotatedZ = node.x * sin + node.z * cos;
    
    const scale = 300 / (300 + rotatedZ);
    
    return {
      x: centerX + rotatedX * scale,
      y: centerY + node.y * scale,
      z: rotatedZ
    };
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time + i) * canvas.width / 4) + canvas.width / 2;
      const y = (Math.cos(time + i * 0.7) * canvas.height / 4) + canvas.height / 2;
      const alpha = (Math.sin(time + i) + 1) / 4;
      
      ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawNodeInfo = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, node: VisualizationNode) => {
    const infoX = 20;
    const infoY = 20;
    const infoWidth = 300;
    const infoHeight = 120;

    // Background
    ctx.fillStyle = theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
    ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
    
    // Border
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);

    // Text
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText(`Category: ${node.category}`, infoX + 10, infoY + 25);
    ctx.fillText(`Importance: ${Math.round(node.importance * 100)}%`, infoX + 10, infoY + 45);
    ctx.fillText(`Connections: ${node.connections.length}`, infoX + 10, infoY + 65);
    
    // Wrapped text
    const words = node.text.split(' ');
    let line = '';
    let y = infoY + 85;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > infoWidth - 20 && line !== '') {
        ctx.fillText(line, infoX + 10, y);
        line = word + ' ';
        y += 16;
        if (y > infoY + infoHeight - 10) break;
      } else {
        line = testLine;
      }
    }
    
    if (line && y <= infoY + infoHeight - 10) {
      ctx.fillText(line, infoX + 10, y);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (const node of nodes) {
      const pos = project3D(node, centerX, centerY);
      const scale = (1000 + node.z) / 2000;
      const size = node.size * scale;
      
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance < size / 2) {
        setSelectedNode(selectedNode?.id === node.id ? null : node);
        break;
      }
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2" />
            Immersive Visualization
          </h2>
          <select
            value={visualizationMode}
            onChange={(e) => setVisualizationMode(e.target.value as any)}
            className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
          >
            <option value="3d">3D Network</option>
            <option value="network">Network Graph</option>
            <option value="timeline">Timeline</option>
            <option value="mindmap">Mind Map</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-lg transition-colors ${isRotating ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`p-2 rounded-lg transition-colors ${showConnections ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}
          >
            <Layers className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setParticleEffects(!particleEffects)}
            className={`p-2 rounded-lg transition-colors ${particleEffects ? 'bg-purple-600 text-white' : 'bg-white/10 text-white'}`}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setAmbientSound(!ambientSound)}
            className={`p-2 rounded-lg transition-colors ${ambientSound ? 'bg-green-600 text-white' : 'bg-white/10 text-white'}`}
          >
            {ambientSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <select
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value as any)}
            className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
          >
            <option value="semantic">Semantic Colors</option>
            <option value="importance">Importance Colors</option>
            <option value="category">Category Colors</option>
          </select>
          
          <button
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Minimize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Visualization Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 100}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
        />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-2 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Legend
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Concepts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Actions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Emotions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Time</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ul className="text-sm space-y-1">
            <li>• Click nodes to view details</li>
            <li>• Larger nodes = higher importance</li>
            <li>• Lines show conceptual connections</li>
            <li>• Auto-rotation shows all angles</li>
          </ul>
        </div>
      </div>
    </div>
  );
};