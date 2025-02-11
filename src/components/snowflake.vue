<template>
    <div
        :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: opacity,
      animationDuration: `${duration}s`,
    }"
        class="snowflake"
    ></div>
</template>

<script>
export default {
    props: {
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        opacity: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
    },
};
</script>

<style scoped>
.snowflake {
    position: absolute;
    background-color: white;
    border-radius: 50%;
    pointer-events: none;
    animation-name: fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
}

@keyframes fall {
    to {
        transform: translateY(95vh);
    }
}
</style>
