<template>
    <div class="click-overlay" @click="handleClick"></div>
    <div class="particle-text-container">
        <div id="canvasContainer"></div>
        <div class="text-overlay" v-if="showOverlay">{{ texts[currentTextIndex] }}</div>
    </div>
</template>

<script>
export default {
    name: 'ParticleText',
    data() {
        return {
            texts: [
                '我们在一起的第100天',
                '每一天都很特别',
                '因为有你❤️'
            ],
            currentTextIndex: 0,
            particles: [],
            particleCount: 2000,
            particleSize: 1.1,
            targetPositions: [],
            animationProgress: 0,
            showOverlay: false,
            colors: ['#ffffff'],
            canvas: null,
            ctx: null,
            animationFrameId: null,
            isTransitioning: false,
            transitionProgress: 0,
            waitingForClick: false,
        }
    },
    mounted() {
        this.initCanvas();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    },
    methods: {
        initCanvas() {
            setTimeout(() => {
                this.canvas = document.createElement('canvas');
                this.canvas.style.position = 'absolute';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                this.canvas.style.zIndex = '1';

                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;

                const container = document.getElementById('canvasContainer');
                if (container) {
                    container.appendChild(this.canvas);
                }

                try {
                    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
                    if (!this.ctx) {
                        console.error('Could not get 2d context');
                        return;
                    }

                    window.addEventListener('resize', this.handleResize);

                    this.createParticleCanvas();
                    this.animateParticles();
                } catch (error) {
                    console.error('Error initializing canvas:', error);
                }
            }, 300);
        },

        handleResize() {
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.createParticleCanvas();
            }
        },

        createParticle() {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const radius = 50;
            const angle = Math.random() * Math.PI * 2;

            return {
                x: centerX + Math.cos(angle) * radius * Math.random(),
                y: centerY + Math.sin(angle) * radius * Math.random(),
                size: this.particleSize * (Math.random() * 0.3 + 0.7),
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1,
                targetX: 0,
                targetY: 0,
                distance: 0,
                angle: 0,
                alpha: 0,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                scatterAngle: null,
            };
        },

        createParticleCanvas() {
            if (!this.ctx) return;

            this.getTextPath();
            this.particles = [];

            for (let i = 0; i < this.particleCount; i++) {
                const particle = this.createParticle();
                if (this.targetPositions[i]) {
                    particle.targetX = this.targetPositions[i].x;
                    particle.targetY = this.targetPositions[i].y;
                }
                this.particles.push(particle);
            }

            this.drawText(true);
        },

        getTextPath() {
            const currentText = this.texts[this.currentTextIndex];
            const fontSize = 80;

            const offscreenCanvas = document.createElement('canvas');
            const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

            offscreenCanvas.width = window.innerWidth;
            offscreenCanvas.height = window.innerHeight;

            offscreenCtx.font = `bold ${fontSize}px 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif`;
            offscreenCtx.fillStyle = 'white';
            offscreenCtx.textAlign = 'center';
            offscreenCtx.textBaseline = 'middle';

            this.targetPositions = [];

            const textWidth = offscreenCtx.measureText(currentText).width;
            const textHeight = fontSize;

            offscreenCtx.fillText(
                currentText,
                offscreenCanvas.width / 2,
                offscreenCanvas.height / 2
            );

            const imageData = offscreenCtx.getImageData(
                offscreenCanvas.width / 2 - textWidth / 2,
                offscreenCanvas.height / 2 - textHeight / 2,
                textWidth,
                textHeight
            );

            const sampleRate = 3;

            for (let y = 0; y < imageData.height; y += sampleRate) {
                for (let x = 0; x < imageData.width; x += sampleRate) {
                    const index = (y * imageData.width + x) * 4;
                    if (imageData.data[index + 3] > 128) {
                        this.targetPositions.push({
                            x: offscreenCanvas.width / 2 - textWidth / 2 + x,
                            y: offscreenCanvas.height / 2 - textHeight / 2 + y,
                        });
                    }
                }
            }

            if (this.targetPositions.length > this.particleCount) {
                this.targetPositions = this.targetPositions
                    .sort(() => Math.random() - 0.5)
                    .slice(0, this.particleCount);
            }
        },

        drawText(transparent = false) {
            const currentText = this.texts[this.currentTextIndex];

            this.ctx.fillStyle = transparent ? 'rgba(255, 255, 255, 0.1)' : 'white';
            this.ctx.font = `bold 80px 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            this.ctx.fillText(currentText, window.innerWidth / 2, window.innerHeight / 2);
        },

        animateParticles() {
            if (!this.ctx || !this.canvas) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.isTransitioning) {
                this.animateTransition();
                return;
            }

            this.particles.forEach((p, index) => {
                if (this.targetPositions[index]) {
                    const target = this.targetPositions[index];
                    const dx = target.x - p.x;
                    const dy = target.y - p.y;
                    p.distance = Math.sqrt(dx * dx + dy * dy);
                    p.angle = Math.atan2(dy, dx);

                    const speed = Math.min(5, p.distance * 0.02);
                    p.x += Math.cos(p.angle) * speed;
                    p.y += Math.sin(p.angle) * speed;

                    p.alpha = Math.min(p.alpha + 0.01, 0.9);

                    this.ctx.beginPath();
                    this.ctx.fillStyle = `rgba(255, 255, 255, 1)`;
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            if (this.animationProgress < 1) {
                this.animationProgress += 0.002;
                this.animationFrameId = requestAnimationFrame(this.animateParticles);
            } else {
                this.waitingForClick = true;
            }
        },

        startTransition() {
            this.isTransitioning = true;
            this.transitionProgress = 0;
            this.animateTransition();
        },

        animateTransition() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const nextIndex = this.currentTextIndex + 1 >= this.texts.length ? 0 : this.currentTextIndex + 1;

            this.particles.forEach((p, index) => {
                if (!p.nextTarget && this.targetPositions[index]) {
                    p.startX = p.x;
                    p.startY = p.y;
                    p.nextTarget = {
                        x: this.targetPositions[index].x,
                        y: this.targetPositions[index].y
                    };
                }

                if (p.nextTarget) {
                    const progress = (1 - Math.cos(this.transitionProgress * Math.PI)) / 2;

                    p.x = p.startX + (p.nextTarget.x - p.startX) * progress;
                    p.y = p.startY + (p.nextTarget.y - p.startY) * progress;

                    const wobble = Math.sin(progress * Math.PI * 2) * 2;
                    p.x += Math.cos(index) * wobble;
                    p.y += Math.sin(index) * wobble;

                    const alpha = 0.6 + Math.sin(progress * Math.PI) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.fillStyle = `rgba(255, 255, 255, 1)`;
                    this.ctx.arc(p.x, p.y, p.size * (1 + Math.sin(progress * Math.PI) * 0.1), 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            this.transitionProgress += 0.01;

            if (this.transitionProgress < 1) {
                this.animationFrameId = requestAnimationFrame(this.animateTransition);
            } else {
                this.currentTextIndex = nextIndex;
                this.isTransitioning = false;
                this.animationProgress = 0;
                this.particles.forEach(p => {
                    delete p.nextTarget;
                    delete p.startX;
                    delete p.startY;
                });
                this.getTextPath();
                this.animateParticles();
            }
        },

        handleClick() {
            if (this.waitingForClick) {
                this.waitingForClick = false;
                this.startTransition();
            }
        },
    }
}
</script>

<style scoped>
@font-face {
    font-family: 'HarmonyOS Sans';
    src: url('//at.alicdn.com/wf/webfont/f2wEXhuB5Vyn/mD1rqPBnK7pH.woff2') format('woff2'),
         url('//at.alicdn.com/wf/webfont/f2wEXhuB5Vyn/osyjWkwZRYYr.woff') format('woff');
}

.particle-text-container {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #000000;
    overflow: hidden;
    cursor: pointer;
    font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
}

#canvasContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.text-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 80px;
    font-weight: bold;
    color: white;
    text-align: center;
    white-space: pre-line;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    opacity: 0;
    animation: fadeIn 2s forwards;
    z-index: 2;
    font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 0.8;
    }
}

.click-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    cursor: pointer;
}
</style>
