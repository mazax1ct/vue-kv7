<script setup></script>

<template>
  <header
    class="d-flex flex-column flex-lg-row align-items-center p-3 px-md-4 bg-white border-bottom shadow-sm"
  >
    <h5 class="my-0 mr-md-auto font-weight-normal me-lg-auto">KV7.store</h5>

    <nav class="me-lg-2 text-center text-lg-start">
      <RouterLink class="p-2 text-dark d-inline-block" to="/">Отчет по отметкам</RouterLink>
      <RouterLink class="p-2 text-dark d-inline-block" to="/report">Общий отчет</RouterLink>
      <RouterLink class="p-2 text-dark d-inline-block" to="/worktime">Управление графиком</RouterLink>
      <RouterLink class="p-2 text-dark d-inline-block" to="/notice">Управление уведомлениями</RouterLink>
    </nav>

    <div class="me-lg-3 mb-2 mb-lg-0 text-secondary">Вы вошли как: <b>admin</b></div>

    <a class="btn btn-sm btn-outline-primary" href="/ajax/do_logout.php">Выход</a>
  </header>
</template>
