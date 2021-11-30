import Menu from 'ant-design-vue/es/menu'
import Icon from 'ant-design-vue/es/icon'
// import { delete } from 'vue/types/umd'

const { Item, SubMenu } = Menu

export default {
  name: 'SMenu',
  props: {
    menu: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      openKeys: [],
      selectedKeys: [],
      cachedOpenKeys: []
    }
  },
  computed: {
    rootSubmenuKeys: vm => {
      const keys = []
      vm.menu.forEach(item => keys.push(item.path))
      return keys
    }
  },
  mounted() {
    this.updateMenu()
  },
  watch: {
    collapsed(val) {
      if (val) {
        this.cachedOpenKeys = this.openKeys.concat()
        this.openKeys = []
      } else {
        this.openKeys = this.cachedOpenKeys
      }
    },
    $route: function() {
      this.updateMenu()
    }
  },
  methods: {
    // select menu item
    onOpenChange(openKeys) {
      // 在水平模式下时执行，并且不再执行后续
      if (this.mode === 'horizontal') {
        this.openKeys = openKeys
        return
      }
      // 非水平模式时
      // const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
      // if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      //     this.openKeys = openKeys;
      // } else {
      //     this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      // }

      //fix bug
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
      let i = this.openKeys.indexOf(latestOpenKey)
      if (i === -1) {
        this.openKeys = openKeys
      } else {
        this.openKeys.splice(i, 1)
      }
    },
    updateMenu() {
      const routes = this.$route.matched.concat()
      const { hidden } = this.$route.meta
      if (routes.length >= 3 && hidden) {
        routes.pop()
        this.selectedKeys = [routes[routes.length - 1].path]
      } else {
        this.selectedKeys = [routes.pop().path]
      }
      const openKeys = []
      if (this.mode === 'inline') {
        routes.forEach(item => {
          openKeys.push(item.path)
        })
      }
      //update-begin-author:taoyan date:20190510 for:online表单菜单点击展开的一级目录不对
      if (!this.selectedKeys || this.selectedKeys[0].indexOf(':') < 0) {
        this.collapsed ? (this.cachedOpenKeys = openKeys) : (this.openKeys = openKeys)
      }
      //update-end-author:taoyan date:20190510 for:online表单菜单点击展开的一级目录不对
    },

    // render
    renderItem(menu) {
      // console.log('运行rrenderItem', menu)
      if (!menu.hidden) {
        if (menu.menuType == 1) {
          delete menu['children']
        }
        return menu.children && menu.children.length !== 0 ? this.renderSubMenu(menu) : this.renderMenuItem(menu)
      }
      return null
    },
    renderMenuItem(menu) {
      // const target = menu.meta.target || null
      const tag = 'router-link'
      let props = { to: { path: menu.url } }
      // if(menu.route && menu.route === '0'){
      //   props = { to: { path: menu.path } }
      // }

      const attrs = { href: menu.url, target: null }
      if (menu.url == '/dashboard/bigscreen') {
        attrs.target = '_blank'
      }
      if (menu.type == 1 && menu.children) {
        // 把有子菜单的 并且 父菜单是要隐藏子菜单的
        // 都给子菜单增加一个 hidden 属性
        // 用来给刷新页面时， selectedKeys 做控制用
        menu.children.forEach(item => {
          if (item.type == 2) {
            item.meta = Object.assign(item.hidden, true)
          }
        })
      }
      let a = (
        <Item {...{ key: menu.url }}>
          <tag {...{ props, attrs }}>
            {' '}
            {this.renderIcon(menu.icon)} <span> {menu.title} </span>{' '}
          </tag>{' '}
        </Item>
      )
      if (menu.url == '/dashboard/bigscreen') {
        window.sc = a
        console.log('返回的item=', a)
      }
      //console.log('返回的item=', a)
      return a
    },
    renderSubMenu(menu) {
      const itemArr = []
      menu.children.forEach(item => itemArr.push(this.renderItem(item)))
      return (
        <SubMenu {...{ key: menu.url }}>
          <span slot="title">
            {' '}
            {this.renderIcon(menu.icon)} <span> {menu.title} </span>{' '}
          </span>{' '}
          {itemArr}{' '}
        </SubMenu>
      )
    },
    renderIcon(icon) {
      if (icon === 'none' || icon === undefined) {
        return null
      }
      const props = {}
      typeof icon === 'object' ? (props.component = icon) : (props.type = icon)
      return <Icon {...{ props }} />
    }
  },

  render() {
    const { mode, theme, menu } = this
    const props = {
      mode: mode,
      theme: theme,
      openKeys: this.openKeys
    }
    const on = {
      select: obj => {
        this.selectedKeys = obj.selectedKeys
        this.$emit('select', obj)
      },
      openChange: this.onOpenChange
    }

    let menus = JSON.parse(JSON.stringify(menu))
    //console.log('我要渲染菜单了')
    const menuTree = menus.map(item => {
      if (item.hidden) {
        return null
      }
      return this.renderItem(item)
    })
    // {...{ props, on: on }}
    let amenu = (
      <Menu vModel={this.selectedKeys} {...{ props, on: on }}>
        {' '}
        {menuTree}{' '}
      </Menu>
    )
    console.log('menu ====>' + amenu)
    return amenu
  }
}
