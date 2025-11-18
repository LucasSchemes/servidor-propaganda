<template>
  <div class="slide-item" :class="{ 'slide-expirado': isExpirado(slide.dataExpiracao) }">
    <h3>{{ slide.titulo }}</h3>
    <div class="slide-info">
      <p><strong>Duração:</strong> {{ slide.duracao }} segundos</p>
      <p><strong>Expira em:</strong> {{ formatarData(slide.dataExpiracao) }}</p>
    </div>
    <div class="slide-actions">
      <button class="edit-btn" @click="emit('editar', slide)">Editar</button>
      <button class="delete-btn" @click="emit('deletar', slide._id)">Remover</button>
    </div>
  </div>
</template>

<script setup>
// Props (recebe o slide do SlideList)
defineProps({
  slide: {
    type: Object,
    required: true
  }
})

// Emits (avisa o SlideList)
const emit = defineEmits(['editar', 'deletar'])

// Funções Auxiliares
const formatarData = (dataISO) => {
  return new Date(dataISO).toLocaleString('pt-BR')
}
const isExpirado = (dataISO) => {
  return new Date(dataISO) <= new Date()
}
</script>

<style scoped>
.slide-item {
  background: #fff;
  border: 1px solid #eee;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}
.slide-item h3 {
  margin: 0 0 1rem 0;
  color: #007bff;
}
.slide-info p {
  margin: 0.25rem 0;
  color: #555;
  font-size: 0.9rem;
}
.slide-info p strong {
  color: #333;
}
.slide-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}
.slide-actions .edit-btn,
.slide-actions .delete-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
}
.slide-actions .edit-btn {
  background-color: #ffc107;
  color: #333;
}
.slide-actions .delete-btn {
  background-color: #d93025;
}
.slide-expirado {
  opacity: 0.5;
  background-color: #f8f9fa;
  border-color: #e9ecef;
}
.slide-expirado h3 {
  color: #6c757d;
  text-decoration: line-through;
}
</style>