<template>
  <div class="stat-card">
    <div class="stat-title">{{ title }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-desc">{{ description }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  description: String
})
</script>

<style scoped lang="scss">
.stat-card {
  flex: 1 1 160px;
  min-width: 160px;
  background: #fff;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.stat-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-desc {
  font-size: 11px;
  color: #9ca3af;
}
</style>
