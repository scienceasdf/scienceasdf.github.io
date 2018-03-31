---
title: 将VS code和Sublime Text3的VIM改成behave-mswin-like
categories:
- Programming
tags:
- Editor
- Vim
updated: 2018-03-31
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**修改sublime和VS code的keymap配置，使其能够有mswin.vim的操作方式。**

---

---

最近学习VIM，但是我一般不直接用VIM，因为配置插件太过于麻烦，而且UI感觉也不美观，因此我用的都是别的IDE/编辑器的VIM操作模式。Qt creator自带的fakeVim感觉非常好用，因为可以直接导入vimrc文件。我平时的习惯还是希望能够有mswin.vim的配置，包括Home和End键，Qt Creator导入很方便。而Kate, Kile虽然也提供导入vimrc文件的功能，但是实现很不完整，还是需要自己手动修改keymap。Kile是一个可以支持vim操作模式的LaTeX的IDE，这一点非常好。 

## Kate和Kile
这个一开始就是在设置里面进行手动地输入。也需要改一下热键，Ctrl+Q原本是关闭程序的，我把它改成了Alt+Q。最后得到了一个katevirc的文件，Kile和KDevelop都会按照这个配置来。文件的全文如下：
```
[Kate Vi Input Mode Settings]
Command Mode Mapping Keys=
Command Mode Mappings=
Command Mode Mappings Recursion=
Insert Mode Mapping Keys=<c-y>,<end>,<c-v>,<c-z>,<home>,<c-a>
Insert Mode Mappings=<c-o><c-r>,<c-o>$,<esc>"+gPi,<c-o>u,<c-o>^,<esc>ggvG
Insert Mode Mappings Recursion=false,false,false,false,false,false
Macro Completions=
Macro Contents=
Macro Registers=
Map Leader=\\
Normal Mode Mapping Keys=<c-y>,<c-tab>,<c-q>,<end>,<c-v>,<c-s>,<c-z>,<home>,<c-a>,<c-f4>
Normal Mode Mappings=U,<c-w>w,<c-v>,$,"+gP,:w<cr>,u,^,ggvG,<c-w>c
Normal Mode Mappings Recursion=false,false,false,false,false,false,false,false,false,false
Visual Mode Mapping Keys=<c-x>,<end>,<c-v>,<home>,<c-a>,<c-c>
Visual Mode Mappings="+x,$,"+p,^,vggvG,"+y<esc>
Visual Mode Mappings Recursion=false,false,false,false,false,false
```


## Sublime Text 3
这个需要安装插件NeoVintageous，别的插件功能太弱。这个插件可以自己写配置文件，不过也不是很强大，imap这些不支持。不过在Insert Mode里面似乎是直接支持相关操作的。另外不知道为什么，Normal Mode里面的Ctrl+S不可用。配置文件全文如下：
```
"" backspace in Visual mode deletes selection  
vnoremap <BS> d  
"   
"" CTRL-X and SHIFT-Del are Cut  
vnoremap <C-x> "+x  
"
vnoremap <S-Del> "+x  
"   
"" CTRL-C and CTRL-Insert are Copy  
vnoremap <C-c> "+y  
vnoremap <C-Insert> "+y  
"   
"" CTRL-V and SHIFT-Insert are Paste  
""map <C-v>        p  
noremap <C-v>         "+p 

"" Pasting blockwise and linewise selections is not possible in Insert and  
"" Visual mode "without the +virtualedit feature.  They are pasted as if they  
"" were characterwise instead.  
"" Uses the paste.vim auto"load script.  
"   
vmap <S-Insert>        <C-V>  
"   
"" Use CTRL-Q to do what CTRL-V used to do 
nnoremap <C-q>        <C-v>  
"   
"" Use CTRL-S for saving, also in Insert mode  
"noremap <C-s>        :w   
"vnoremap <C-s>       v:w  
"   

"" CTRL-Z is Undo; not in cmdline though  
noremap <C-z> u  
"   
"" CTRL-Y is Redo (although not repeat); not in cmdline though  
noremap <C-y> <C-r>  
""inoremap <C-Y> <C-O><C-R>  
"
"" CTRL-A is Select all  
noremap <C-a> ggvG
""onoremap <C-a> <C-C>gggH<C-O>G  
""snoremap <C-a> <C-C>gggH<C-O>G  
vnoremap <C-a> vggvG   
"" CTRL-Tab is Next window  
noremap <C-Tab> <C-W>w  
onoremap <C-Tab> <C-C><C-W>w   
"
"   
"" CTRL-F4 is Close window  
noremap <C-F4> <C-W>c  
onoremap <C-F4> <C-C><C-W>c  
"     
nnoremap i i<Ctrl-Shift-1>  
```


## VS Code
这个需要同时改一些Key binding和vim插件的配置，用户设置文件如下：
```json
{
    "markdown-preview-enhanced.mathRenderingOption": "MathJax",
    "emmet.showSuggestionsAsSnippets": true,
    "[markdown]": {
        "editor.quickSuggestions":true    
    },
    "latex-workshop.view.pdf.viewer": "tab",
    "latex-workshop.view.pdf.hand": true,
    // 可变编译方式 
    "latex-workshop.latex.toolchain": [
        {
          "command": "", // 注意这里是留空的
          "args": [
            "-synctex=1",
            "-interaction=nonstopmode",
            "-file-line-error",
            "%DOC%"
          ]
        }
      ],
      "window.zoomLevel": 1,
      "vim.neovimPath": "D:\\downloads\\nvim-win64\\Neovim\\bin\\nvim.exe",
      "vim.enableNeovim": true,
      "vim.insertModeKeyBindings": [
        {  
          "before":["<C-v>"],  
          "after":["\"+gP"],  
        },  
      ],
      "vim.insertModeKeyBindingsNonRecursive": [
        {  
          "before":["<C-s>"],  
          "after":["<C-o>:w"],  
        }, 
        {  
          "before":["<C-z>"],  
          "after":["<C-o>u"],  
        },  
        {  
          "before":["<C-y>"],  
          "after":["<C-o><C-r>"],  
        },
        {  
          "before":["<C-a>"],  
          "after":["<C-o>gg<C-o>gH<C-o>G"],  
        },
         {  
          "before":["<C-Tab>"],  
          "after":["<C-O><C-W>w"],  
        },
         {  
          "before":["<C-F4>"],  
          "after":["<C-O><C-W>c"],  
        },       
      ],
      "vim.otherModesKeyBindingsNonRecursive": [
        {  
          "before":["<C-s>"],  
          "after":[":w"],  
        },
        {  
          "before":["<C-z>"],  
          "after":["u"],  
        }, 
        {  
          "before":["<C-y>"],  
          "after":["<C-r>"],  
        },
        {  
          "before":["<C-a>"],  
          "after":["gggH<C-O>G"],  
        },
        {  
          "before":["<C-F4>"],  
          "after":["<C-w>c"],  
        },
      ],
      "vim.otherModesKeyBindings": [],
  }
```
Key Binding的配置文件如下：
```json
// 将键绑定放入此文件中以覆盖默认值
[
    {
        "key": "alt+q",
        "command": "workbench.action.quickOpenView"
    },
    {
        "key": "ctrl+q",
        "command": "-workbench.action.quickOpenView"
    },
    {
        "key": "alt+q",
        "command": "workbench.action.quickOpenNavigateNextInViewPicker",
        "when": "inQuickOpen && inViewsPicker"
    },
    {
        "key": "ctrl+q",
        "command": "-workbench.action.quickOpenNavigateNextInViewPicker",
        "when": "inQuickOpen && inViewsPicker"
    },
    {
        "key": "alt+y",
        "command": "extension.vim_ctrl+y",
        "when": "editorTextFocus && vim.active && vim.use<C-y> && !inDebugRepl"
    },
    {
        "key": "ctrl+y",
        "command": "-extension.vim_ctrl+y",
        "when": "editorTextFocus && vim.active && vim.use<C-y> && !inDebugRepl"
    },
    {
        "key": "alt+a",
        "command": "extension.vim_ctrl+a",
        "when": "editorTextFocus && vim.active && vim.use<C-a> && !inDebugRepl"
    },
    {
        "key": "ctrl+a",
        "command": "-extension.vim_ctrl+a",
        "when": "editorTextFocus && vim.active && vim.use<C-a> && !inDebugRepl"
    },
    {
        "key": "alt+c",
        "command": "extension.vim_ctrl+c",
        "when": "editorTextFocus && vim.active && vim.overrideCtrlC && vim.use<C-c> && !inDebugRepl"
    },
    {
        "key": "ctrl+c",
        "command": "-extension.vim_ctrl+c",
        "when": "editorTextFocus && vim.active && vim.overrideCtrlC && vim.use<C-c> && !inDebugRepl"
    },
    {
        "key": "ctrl+q",
        "command": "extension.vim_ctrl+v",
        "when": "editorTextFocus && vim.active && vim.use<C-v> && !inDebugRepl && vim.mode != 'Insert'"
    },
    {
        "key": "ctrl+v",
        "command": "-extension.vim_ctrl+v",
        "when": "editorTextFocus && vim.active && vim.use<C-v> && !inDebugRepl && vim.mode != 'Insert'"
    }
]
```


## 其他
还是没有解决输入法切换的Keymap:disappointed:。还有为什么Jekyll的右边生成的目录排版有时会抽风啊？
