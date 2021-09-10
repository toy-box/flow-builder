import 'braft-editor/dist/index.css';
import './index.less';
import React, { FC, useState, useEffect, useCallback } from 'react';
import BraftEditor from 'braft-editor';
import { Modifier, EditorState, convertFromRaw } from 'draft-js'
import { convertHTMLToRaw } from 'braft-convert'
import { useForm, observer } from '@formily/react'
import { TextWidget } from '../../../widgets'

const entityExtension = {
  // 指定扩展类型
  type: 'entity',
  // 指定该扩展对哪些编辑器生效，不指定includeEditors则对所有编辑器生效
  includeEditors: ['demo-editor-with-entity-extension'],
  // 指定扩展的entity名称，推荐使用全部大写，内部也会将小写转换为大写
  name: 'KEYBOARD-ITEM',
  // // 在编辑器工具栏中增加一个控制按钮，点击时会将所选文字转换为该entity
  // control: {
  //   text: '按键',
  // },
  // 指定entity的mutability属性，可选值为MUTABLE和IMMUTABLE，表明该entity是否可编辑，默认为MUTABLE
  mutability: 'IMMUTABLE',
  // 指定通过上面新增的按钮创建entity时的默认附加数据
  data: {
    foo: 'hello',
  },
  // 指定entity在编辑器中的渲染组件
  component: (props: { contentState: { getEntity: (arg0: any) => any; }; entityKey: any; children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
    // 通过entityKey获取entity实例，关于entity实例请参考https://github.com/facebook/draft-js/blob/master/src/model/entity/DraftEntityInstance.js
    const entity = props.contentState.getEntity(props.entityKey);
    // 通过entity.getData()获取该entity的附加数据
    const { foo } = entity.getData();
    return <span data-foo={foo} className="keyboard-item">{props.children}</span>;
  },
  // 指定html转换为editorState时，何种规则的内容将会转换成该entity
  importer: (nodeName: string, node: { classList: { contains: (arg0: string) => any; }; dataset: { foo: any; }; }, source: any) => {
    // source属性表明输入来源，可能值为create、paste或undefined
    if (nodeName.toLowerCase() === 'span' && node.classList && node.classList.contains('keyboard-item')) {
      // 此处可以返回true或者一个包含mutability和data属性的对象
      return {
        mutability: 'IMMUTABLE',
        data: {
          foo: node.dataset.foo,
        },
      };
    }
    return null;
  },
  // 指定输出该entnty在输出的html中的呈现方式
  exporter: (entityObject: { data: { foo: any; }; }, originalText: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined) => {
    // 注意此处的entityObject并不是一个entity实例，而是一个包含type、mutability和data属性的对象
    const { foo } = entityObject.data;
    return <span data-foo={foo} className="keyboard-item">{originalText}</span>;
  },
};

BraftEditor.use(entityExtension);

const insertHTML = (editorState: any, htmlString: any, source?: any) => {

  if (!htmlString) {
    return editorState
  }

  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const options = editorState.convertOptions || {}

  try {

    const { blockMap } = convertFromRaw(convertHTMLToRaw(htmlString, options, source))

    return EditorState.push(editorState, Modifier.replaceWithFragment(
      contentState, selectionState, blockMap
    ), 'insert-fragment')

  } catch (error) {
    console.warn(error)
    return editorState
  }

}

export const BraftEditorTemplate: FC<any> = observer((props: any) => {
  const form = useForm()
  const [content, setContent] = useState(props.value)
  const [editorState, setEditorState] = useState()
  const [outputHTML, setOutputHTML] = useState<any>()

  useEffect(() => {
    const htmlContent = content;
    setEditorState(BraftEditor.createEditorState(htmlContent, { editorId: 'demo-editor-with-entity-extension' }))
    setOutputHTML(null)
  }, [content])

  const insertHello = useCallback((obj: { fieldId: any; fieldName: any; }) => {
    setEditorState(insertHTML(editorState, `<span class="keyboard-item" data-foo="${obj.fieldId}">${obj.fieldName}</span>`))
  }, [editorState])

  const handleChange = useCallback((editorState: any) => {
    setEditorState(editorState)
    setOutputHTML(editorState.toHTML())
    form.setFieldState('text', (state) => {
      state.value = editorState.toHTML()
    })
    const editorContent: any = window.document.querySelector(
      '.notranslate.public-DraftEditor-content');
    if (editorContent) {
      // 因没有提供接口来关闭下拉菜单，故点击下拉菜单项时只能通过使其失去焦点的方式来关闭
      // editorContent.focus();
      editorContent.click();
    }
  }, [])

  const excludeControls = ['media'];
  const offerFields = [
    {"fieldId":"talentName","fieldName":"候选人姓名"}
    ,{"fieldId":"offerCreatedDate","fieldName":"Offer生成日期"}
    ,{"fieldId":"tenantName","fieldName":"公司名称"}
    ,{"fieldId":"entryDate","fieldName":"预计入职日期"}
    ,{"fieldId":"jobId","fieldName":"Offer职位"}
    ,{"fieldId":"deptId","fieldName":"职位所属部门"}
    ,{"fieldId":"salaryUnit","fieldName":"薪资待遇单位"}
    ,{"fieldId":"salary","fieldName":"薪资待遇"}
    ,{"fieldId":"addressId","fieldName":"入职地点"}
    ,{"fieldId":"hcId","fieldName":"HC"}
    ,{"fieldId":"rankId","fieldName":"职位级别"}]
  const extendControls = [
    {
      key: 'custom-dropdown',
      type: 'dropdown',
      text: <TextWidget>flow.form.template.customTitle</TextWidget>,
      autoHide: true,
      className: 'hire-custom-dropdown',
      arrowActive: true,
      component: offerFields.map(item =>
        <p
          key={item.fieldId}
          onClick={insertHello.bind(this, item)}
          className="item">
            {item.fieldName}
        </p>),
    },
  ];

  return (
    <div className="editor-wrapper">
      <BraftEditor 
      id="demo-editor-with-entity-extension"
      value={editorState as any}
      // readOnly={readOnly}
      excludeControls={excludeControls as any}
      onChange={handleChange.bind(this)}
      extendControls={extendControls as any}
      contentStyle={{ height: 200, boxShadow: 'inset 0 1px 3px rgba(0,0,0,.1)' }}
      />
       {/* <h5>输出内容</h5>
      <div className="output-content">{outputHTML}</div> */}
    </div>
  )
})
