<script>
</script>


<template>
    <main class="welcome">
        <h1> LOL </h1>
    </main>
</template>


<style>
    .welcome {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    margin-top: 0;
    box-sizing: border-box;
    }   

    .welcome h1 {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 700;
    text-align: center;
    color: black;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0;
    padding: 0 20px;
    background-size: 200% auto;
    }

    @media (max-width: 768px) {
    .welcome {
        min-height: 80vh;
        padding: 10px;
    }

    .welcome h1 {
        font-size: clamp(1.5rem, 8vw, 3rem);
        line-height: 1.2;
        }
    }

    @media (max-width: 480px) {
    .welcome h1 {
        font-size: clamp(1.25rem, 6vw, 2rem);
        padding: 0 15px;
        }
    }
</style>
