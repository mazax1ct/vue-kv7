<script setup></script>

<template>
  <header
    class="flex flex-col xl:flex-row items-center p-3 md:px-4 bg-white border-bottom shadow-sm"
  >
    <h5 class="my-0 xl:mr-auto font-bold text-lg">KV7.store</h5>

    <nav class="mb-1.5 xl:mb-0 xl:mr-2 text-center">
      <RouterLink class="p-2 text-dark inline-block hover:underline" to="/">Отчет по отметкам</RouterLink>
      <RouterLink class="p-2 text-dark inline-block hover:underline" to="/report">Общий отчет</RouterLink>
      <RouterLink class="p-2 text-dark inline-block hover:underline" to="/worktime">Управление графиком</RouterLink>
      <RouterLink class="p-2 text-dark inline-block hover:underline" to="/notice">Управление уведомлениями</RouterLink>
    </nav>

    <div class="mb-2 xl:mb-0 xl:mr-3 text-secondary">Вы вошли как: <b>admin</b></div>

    <a class="py-1 px-2 border-sky-600 border-solid border rounded-sm text-sky-600 hover:bg-sky-600 hover:text-white" href="/ajax/do_logout.php">Выход</a>
  </header>
</template>

<style>
  .router-link-active {
    text-decoration: underline;
  }
</style>
