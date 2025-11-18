<template>
  <section class="list-section">
    <h2>Slides Cadastrados</h2>

    <div v-if="slides.length === 0">
      <p>Nenhum slide cadastrado.</p>
    </div>

    <div id="slide-list" v-else>
      <SlideItem
        v-for="slide in slides"
        :key="slide._id"
        :slide="slide"
        @editar="emit('editar', $event)"
        @deletar="emit('deletar', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import SlideItem from './slideItem.vue'

// recebe a lista de slides do AdminView
defineProps({
  slides: {
    type: Array,
    required: true
  }
})

// repassa os eventos para o AdminView
const emit = defineEmits(['editar', 'deletar'])
</script>

<style scoped>
.list-section {
  flex: 2;
  min-width: 400px;
}
h2 {
  color: #333;
  margin-top: 0;
}
</style>