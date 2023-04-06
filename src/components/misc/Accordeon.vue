<template>
    <div class="" :class="{'bg-gray-100': ownValue  && !disabled}">
        <div class="tab__header w-full" :class="{'bg-gray-100': ownValue && !disabled}">
            <div
                class="cursor-pointer tab__link py-1 px-2 block bg-blue-dark hover:bg-blue-darker no-underline flex flex-center justify-between"
                @click.prevent="ownValue = !ownValue"
            >
                <strong v-if="!$slots.title" class="text-lg">{{title}}</strong>
                <slot name="title" v-else/>
                <span class="text-sm down-Arrow" v-show="!ownValue && !disabled && !hideToggler">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </span>
                <span class="text-sm up-Arrow" v-show="ownValue && !disabled && !hideToggler">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                    </svg>

                </span>
            </div>
        </div>
        <div class="tab__content p-2" v-show="ownValue && !disabled"><slot /></div>
    </div>
</template>

<script>
    import { defineComponent, PropType } from 'vue'

    export default defineComponent({
        props: [
            "title",
            "value",
            "disabled",
            "hideToggler"
        ],
        data() {
            return {
                ownValue: this.value,
            }
        },
        watch: {
            ownValue(nV) {
                this.$emit("update:value", nV)
            },
            value(nV) {
                this.ownValue = nV
            }
        }
    })
</script>
