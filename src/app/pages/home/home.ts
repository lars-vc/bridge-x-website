import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Topbar } from "../../components/topbar/topbar";

@Component({
  selector: 'app-home',
  imports: [Topbar],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('networkCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D | null;
  private width = 0;
  private height = 0;
  private nodes: any[] = [];
  private amount = 0; // will be computed from viewport
  private minNodes = 40;
  private maxNodes = 200;
  private shown1 = false;
  private shown2 = false;
  private shown3 = false;
  private rafId = 0;
  private start = 0;
  private startOfXFormation = 1.5;
  private resizeHandler = () => this.onResize();

  private onResize(): void {
    this.resize(); // updates this.width/height and canvas size
    this.startOfXFormation = 0.5
    this.updateAmountAndNodes(true);
  }

  private cssToRgba(cssColor: string, alpha = 1): string {
    const s = (cssColor || '').trim();
    if (!s) return `rgba(161,161,170,${alpha})`; // fallback to silver

    // hex #RRGGBB or #RGB
    if (s[0] === '#') {
      let hex = s.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }
    }

    // rgb() or rgba()
    const rgbMatch = s.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map(p => p.trim());
      const r = parts[0] || '161';
      const g = parts[1] || '161';
      const b = parts[2] || '170';
      return `rgba(${r},${g},${b},${alpha})`;
    }

    // named color or other - return as-is (canvas accepts names), but alpha can't be applied
    return s;
  }

  private computeAmount(): number {
    const minDim = Math.min(this.width || window.innerWidth, this.height || window.innerHeight);
    const calculated = Math.round(minDim * 0.10); // scale factor: 0.25 * min dimension
    return Math.max(this.minNodes, Math.min(this.maxNodes, calculated));
  }

  private updateAmountAndNodes(recreate = false): void {
    const newAmount = this.computeAmount();
    if (recreate || this.amount !== newAmount) {
      this.amount = newAmount;
      this.nodes = [];
      for (let i = 0; i < this.amount; i++) {
        this.nodes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 4 + 2,
          tx: 0,
          ty: 0,
          offset: Math.random() * 10,
        });
      }
      this.createXStructure();
    }
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resizeHandler);

    // compute node amount based on current viewport and create nodes
    this.updateAmountAndNodes(true);
    this.start = performance.now();
    this.rafId = requestAnimationFrame((t) => this.animate(t));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
  }

  private createXStructure(): void {
    const centerX = this.width * 0.28; // move X to the left side
    const centerY = this.height * 0.5;
    const baseSpread = Math.min(this.width, this.height) * 0.18; // base scale for the X
    const xSpread = baseSpread * 0.9; // horizontal half-width (smaller)
    const ySpread = baseSpread * 1.4; // vertical half-height (taller) to look more like an 'X'
    const thickness = Math.min(this.width, this.height) * 0.06; // perpendicular spread for thicker legs

    const perSide = Math.ceil(this.amount / 2);

    const xStart = centerX - xSpread;
    const xEnd = centerX + xSpread;

    this.nodes.forEach((node, index) => {
      const sideIndex = Math.floor(index / 2);
      const progress = perSide > 1 ? sideIndex / (perSide - 1) : 0;

      const baseX = xStart + progress * (xEnd - xStart);
      const baseY = index % 2 === 0
        ? centerY - ySpread + progress * (2 * ySpread)
        : centerY + ySpread - progress * (2 * ySpread);

      // compute perpendicular unit vector for the diagonal line
      const dxLine = xEnd - xStart;
      const dyLine = (index % 2 === 0) ? (2 * ySpread) : (-2 * ySpread);
      const len = Math.sqrt(dxLine * dxLine + dyLine * dyLine) || 1;
      const px = -dyLine / len; // perpendicular x
      const py = dxLine / len;  // perpendicular y

      // random offset along perpendicular to create thickness
      const offset = (Math.random() - 0.5) * thickness;

      node.tx = baseX + px * offset;
      node.ty = baseY + py * offset;
    });
  }

  private animate(time: number): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const seconds = (time - this.start) / 1000;

    ctx.clearRect(0, 0, this.width, this.height);

    this.nodes.forEach((node) => {
      if (seconds < this.startOfXFormation) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > this.width) node.vx *= -1;
        if (node.y < 0 || node.y > this.height) node.vy *= -1;
      }

      if (seconds >= this.startOfXFormation) {
        const force = Math.min((seconds - this.startOfXFormation) / this.startOfXFormation, 1);
        node.x += (node.tx - node.x) * 0.01 * force;
        node.y += (node.ty - node.y) * 0.01 * force;
        node.x += Math.sin(time / 900 + node.offset) * 0.25;
        node.y += Math.cos(time / 1100 + node.offset) * 0.25;
      }
    });

    const cssNode = getComputedStyle(document.documentElement).getPropertyValue('--node-color') || '';
    // connections
    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          const pulse = 0.08 + (Math.sin(time / 800) + 1) * 0.04;
          // ctx.strokeStyle = `rgba(0,71,171,${pulse})`;
          ctx.strokeStyle = this.cssToRgba(cssNode.trim(), pulse);
          ctx.stroke();
        }
      }
    }

    // nodes
    // determine node fill color from CSS variable (configurable)
    const nodeFill = this.cssToRgba(cssNode.trim(), 0.85);

    this.nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = nodeFill;
      ctx.fill();
    });

    // Reveal legend sequence: text1, (arrow1+text2), (arrow2+text3)
    if (seconds > this.startOfXFormation + 0.6 && !this.shown1) {
      const t1 = document.getElementById('xText1');
      if (t1) t1.classList.add('show');
      this.shown1 = true;
    }

    if (seconds > this.startOfXFormation + 1.4 && !this.shown2) {
      const a1 = document.getElementById('xArrow1');
      const t2 = document.getElementById('xText2');
      if (a1) a1.classList.add('show');
      if (t2) t2.classList.add('show');
      this.shown2 = true;
    }

    if (seconds > this.startOfXFormation + 2.2 && !this.shown3) {
      const a2 = document.getElementById('xArrow2');
      const t3 = document.getElementById('xText3');
      if (a2) a2.classList.add('show');
      if (t3) t3.classList.add('show');
      this.shown3 = true;
    }

    this.rafId = requestAnimationFrame((t) => this.animate(t));
  }
}
