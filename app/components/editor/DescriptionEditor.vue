<script setup lang="ts">
import { ref, watch, onBeforeUnmount, useId } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { List, Type } from '@lucide/vue'
import { descriptionToHTML, tiptapJSONToDescription } from '~/utils/cvText'

const props = defineProps<{
  modelValue?: string | null
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const labelId = useId()
const isInternalUpdate = ref(false)

const editor = useEditor({
  content: descriptionToHTML(props.modelValue),
  extensions: [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      strike: false,
      code: false,
      bold: false,
      italic: false,
      dropcursor: false,
      gapcursor: false,
    }),
  ],
  editorProps: {
    attributes: {
      'class': 'prose prose-sm w-full max-w-none outline-none min-h-[120px] p-4 text-[16px]',
      'enterkeyhint': 'next',
      'aria-labelledby': labelId,
    },
  },
  onUpdate: ({ editor }) => {
    isInternalUpdate.value = true
    const json = editor.getJSON()
    const text = tiptapJSONToDescription(json)
    emit('update:modelValue', text)
    setTimeout(() => {
      isInternalUpdate.value = false
    }, 0)
  },
})

watch(() => props.modelValue, (newVal) => {
  if (isInternalUpdate.value) return
  if (editor.value) {
    const html = descriptionToHTML(newVal)
    const currentJsonText = tiptapJSONToDescription(editor.value.getJSON())
    if (newVal !== currentJsonText) {
      editor.value.commands.setContent(html)
    }
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

const toggleBulletList = () => {
  if (editor.value) {
    editor.value.chain().focus().toggleBulletList().run()
  }
}

const setParagraph = () => {
  if (editor.value) {
    editor.value.chain().focus().setParagraph().run()
  }
}
</script>

<template>
  <div class="space-y-1">
    <label
      :id="labelId"
      class="text-sm font-semibold text-gray-700"
    >{{ label }}</label>

    <div class="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-[#C54A22] focus-within:ring-1 focus-within:ring-[#C54A22] transition-colors">
      <div
        v-if="editor"
        class="flex items-center gap-1 p-1 border-b border-gray-100 bg-gray-50/50"
      >
        <button
          type="button"
          class="p-2 h-[44px] w-[44px] rounded-lg transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200"
          :class="{ 'bg-gray-200 text-gray-900': editor.isActive('paragraph') && !editor.isActive('bulletList') }"
          title="Paragraph"
          @click="setParagraph"
        >
          <Type class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-2 h-[44px] w-[44px] rounded-lg transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200"
          :class="{ 'bg-gray-200 text-gray-900': editor.isActive('bulletList') }"
          title="Bullet List"
          @click="toggleBulletList"
        >
          <List class="w-4 h-4" />
        </button>
      </div>

      <EditorContent
        :editor="editor"
        class="w-full h-full cursor-text"
      />
    </div>
  </div>
</template>

<style>
.ProseMirror p {
  margin: 0;
  line-height: 1.5;
}
.ProseMirror ul {
  margin: 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}
.ProseMirror li p {
  margin: 0;
}
</style>
