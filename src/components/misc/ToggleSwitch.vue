<template>
    <div class="flex items-center space-x-2">
        <label :for="id" class="text-sm">{{ label }}</label>
        <div class="relative inline-block w-10 align-middle select-none" :class="{disabled}">
            <input
                type="checkbox"
                :id="id"
                :name="name"
                v-model="checked"
                :disabled="disabled"
                @change="updateValue"
                class="toggle-checkbox hidden"
            />
            <label
                :for="id"
                class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
            ></label>
        </div>
    </div>
</template>

  <script lang="ts">
    import { defineComponent, computed } from 'vue'

    export default defineComponent({
        name: 'ToggleSwitch',
        props: {
            disabled: {
                type: Boolean,
                default: () => false
            },
            value: {
                type: Boolean,
                default: false,
            },
            label: {
                type: String,
                default: '',
            },
            name: {
                type: String,
                default: '',
            },
        },
        setup(props, { emit }) {
            const checked = computed({
                get: () => props.value,
                set: (value) => emit('update:value', value),
            })

            function updateValue() {
                emit('change', checked.value)
            }

            return { checked, updateValue }
        },
        data() {
            return {
                id: `toggle-${Math.random().toString(36).slice(2, 10)}`,
            }
        },
        computed: {

        },
        methods: {

        },
    })
  </script>

  <style lang="scss" scoped>
    .disabled{
        pointer-events: none;
        opacity: 0.4;
    }

  .toggle-checkbox:checked + .toggle-label {
    @apply bg-blue-500;
  }

  .toggle-checkbox:checked + .toggle-label::before {
    @apply transform translate-x-4;
  }

  .toggle-checkbox:focus + .toggle-label {
    @apply ring-2 ring-blue-200;
  }

  .toggle-label {
    @apply transition ease-in duration-200;
  }

  .toggle-label:before {
    content: "";
    position: absolute;
    top: 1px;
    left: 0;
    height: 1.4rem;
    width: 1.4rem;
    background-color: white;
    border-radius: 9999px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transform: translateX(0);
    transition: transform 200ms ease-in;
}

  </style>
