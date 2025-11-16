<template>
  <RouterView />
</template>

<script setup>
/*
  Importamos os componentes do roteador.
  Neste arquivo <script setup>, não precisamos fazer mais nada,
  pois toda a lógica (login, slides) está nos
  próprios componentes de visualização (View).
*/
import { RouterView } from 'vue-router'
</script>

<style scoped>
/* Vamos deixar o CSS 'scoped' deste arquivo vazio por enquanto.
  Vamos colocar os estilos globais em um arquivo separado
  para manter as coisas organizadas.
*/
</style>