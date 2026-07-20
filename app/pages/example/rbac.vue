<script setup lang="ts">
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "rbac page",
});

</script>

<template>
  <BaseDashboardPanel id="example-rbac" title="rbac page">
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <UCard title="Via Compasable" class="w-full">
          <UAlert variant="outline">
            <template #description>
              <pre><code>
                {{ `
                  const { hasPermission } = useRbac()
                  const isCan = computed(() => {
                    return hasPermission({
                      permissions: ['app_user_add'],
                    })
                  })
                `}}

              </code></pre>
            </template>
          </UAlert>
        </UCard>
      </div>
      <div>
        <UCard title="Via Directive" class="w-full">
          <div class="flex w-full flex-col gap-4">
            <UAlert variant="outline">
              <template #description>
                <UButton
                  label="Single permission"
                  class="w-fit"
                  v-rbac="{
                    permissions: ['app_user_add'],
                  }"
                />
                <pre><code>
                {{ ` <UButton
                      label="Single permission"
                      v-rbac="{
                        permissions: ['app_user_add'],
                      }"
                    />`}}

              </code></pre>
              </template>
            </UAlert>

            <UAlert variant="outline">
              <template #description>
                <UButton
                  class="w-fit"
                  label="Any of multiple permissions"
                  v-rbac="{
                    permissions: ['user_manage_not_exist', 'app_role_add'],
                    condition: 'any',
                  }"
                />
                <pre><code>
                {{ ` <UButton
                      label="Any of multiple permissions"
                      v-rbac="{
                        permissions: ['user_manage_not_exist', 'app_role_add'],
                        condition: 'any',
                      }"
                    />`}}

              </code></pre>
              </template>
            </UAlert>

            <UAlert variant="outline">
              <template #description>
                <UButton
                  class="w-fit"
                  label="All permissions required"
                  v-rbac="{
                    permissions: ['user_manage_not_exist', 'app_role_add'],
                    condition: 'all',
                  }"
                />
                <pre><code>
                {{ ` <UButton
                       label="All permissions required"
                      v-rbac="{
                        permissions: ['user_manage_not_exist', 'app_role_add'],
                        condition: 'all',
                      }"
                    />`}}

              </code></pre>
              </template>
            </UAlert>

            <UAlert variant="outline">
              <template #description>
                <UButton
                  class="w-fit"
                  label="Negation (not)"
                  v-rbac="{
                    permissions: ['user_manage_not_exist'],
                    condition: 'not',
                  }"
                />
                <pre><code>
                {{ ` <UButton
                       label="Negation (not)"
                      v-rbac="{
                        permissions: ['user_manage_not_exist'],
                        condition: 'not',
                      }"
                    />`}}

              </code></pre>
              </template>
            </UAlert>

            <UAlert variant="outline">
              <template #description>
                <UButton
                  class="w-fit"
                  label="This is Not eligible"
                  v-rbac="{
                    permissions: ['user_manage_not_exist'],
                  }"
                />
                <pre><code>
                {{ ` <UButton
                       label="This is Not eligible"
                      v-rbac="{
                        permissions: ['user_manage_not_exist'],
                      }"
                    />`}}

              </code></pre>
              </template>
            </UAlert>
          </div>
        </UCard>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
