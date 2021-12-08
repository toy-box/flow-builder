import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IFieldMeta, MetaValueType } from '@toy-box/meta-schema';
import { ExpressionEditor } from '@toy-box/expression-editor'
// import { GlobalRegistry,
//   Navbar, FlowEditor,
//   DesignerContext,
//   AutoFlow,
//   flow, getMetaObjectData } from '../../src'

const variableMap = {
  $currentUser: {
    key: '123',
    name: 'currentUser',
    type: 'object',
    properties: {
      id: {
        key: 'id',
        name: 'ID',
        type: 'number',
      },
      name: {
        key: 'name',
        name: 'Name',
        type: 'string',
      },
      project: {
        key: 'project',
        name: 'Project',
        type: 'object',
        properties: {
          id2: {
            key: 'id2',
            name: 'ID2',
            type: 'number',
          },
          name2: {
            key: 'name2',
            name: 'Name2',
            type: 'string',
          },
          project2: {
            key: 'project2',
            name: 'Project2',
            type: 'object',
            properties: {
              id3: {
                key: 'id3',
                name: 'ID3',
                type: 'number',
              },
              name3: {
                key: 'name3',
                name: 'Name3',
                type: 'string',
              },
            },
          },
        },
      },
      books: {
        key: '444',
        name: 'books',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            price: {
              key: 'price',
              type: 'number',
              name: 'price',
            },
            authors: {
              key: 'authors',
              type: 'array',
              name: 'authors',
              items: {
                type: 'object',
                properties: {
                  name: {
                    key: 'name',
                    type: 'string',
                    name: 'name',
                  },
                  age: {
                    key: 'age',
                    type: 'integer',
                    name: 'age',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  $tags: {
    key: '333',
    name: 'tags',
    type: 'array',
    items: {
      type: 'string',
    },
    required: true,
  },
  $books: {
    key: '444',
    name: 'books',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        price: {
          key: 'price',
          type: 'number',
          name: 'price',
        },
        title: {
          key: 'title',
          type: 'string',
          name: 'title',
        },
        authors: {
          key: 'authors',
          type: 'array',
          name: 'authors',
          items: {
            type: 'object',
            properties: {
              name: {
                key: 'name',
                type: 'string',
                name: 'name',
              },
              country: {
                key: 'country',
                type: 'string',
                name: 'country',
              },
            },
          },
        },
      },
    },
  },
  address: {
    key: 'address',
    name: 'Address',
    type: 'object',
    properties: {
      aid: {
        key: 'aid',
        name: 'ID',
        type: 'number',
      },
      aname: {
        key: 'aname',
        name: 'Name',
        type: 'string',
      },
      aproject: {
        key: 'aproject',
        name: 'Project',
        type: 'object',
        properties: {
          aid2: {
            key: 'aid2',
            name: 'ID2',
            type: 'number',
          },
          aname2: {
            key: 'aname2',
            name: 'Name2',
            type: 'string',
          },
          aproject2: {
            key: 'aproject2',
            name: 'Project2',
            type: 'object',
            properties: {
              aid3: {
                key: 'aid3',
                name: 'ID3',
                type: 'number',
              },
              aname3: {
                key: 'aname3',
                name: 'Name3',
                type: 'string',
              },
            },
          },
        },
      },
      abooks: {
        key: '444',
        name: 'abooks',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            aprice: {
              key: 'aprice',
              type: 'number',
              name: 'price',
            },
            aauthors: {
              key: 'aauthors',
              type: 'array',
              name: 'authors',
              items: {
                type: 'object',
                properties: {
                  aname: {
                    key: 'aname',
                    type: 'string',
                    name: 'name',
                  },
                  age: {
                    key: 'age',
                    type: 'integer',
                    name: 'age',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
console.log(1111111111)
const callback = (res: any) => {
  console.log('回调结果：', res);
};
const value = ""

const App = () => (
  <ExpressionEditor
    variableMap={variableMap}
    value={value}
    valueType={MetaValueType.NUMBER}
    onChange={callback}
    width={'100%'}
    height={'400px'}
  />
);

ReactDOM.render(<App />, document.getElementById('container'));
