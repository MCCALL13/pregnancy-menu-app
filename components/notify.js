// notify.js — 飞书自定义机器人 webhook 通知
(function () {
  var WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/11b72e87-5e38-4c41-9e52-7fd16ff35eb5';
  var GROUP_NAME = '宝贝计划·个人专属';

  function pad(n) { return String(n).padStart(2, '0'); }

  function timeLabel(iso) {
    var d = iso ? new Date(iso) : new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function appUrl() {
    try {
      var u = window.location.href.split('#')[0];
      if (/^https?:\/\//.test(u) && !/localhost|127\.0\.0\.1/.test(u)) return u;
    } catch (e) {}
    return '';
  }

  /** 纯文本版（复制/回退用） */
  function buildText(order) {
    var lines = [];
    lines.push('【孕期点菜】' + order.from + '点了' + order.dateLabel + '的菜');
    (order.items || []).forEach(function (g) {
      lines.push(g.meal + '：' + g.dishes.map(function (d) { return d.name; }).join('、'));
    });
    if (order.note) lines.push('备注：' + order.note);
    lines.push('点菜时间：' + timeLabel(order.createdAt));
    var u = appUrl();
    if (u) lines.push(u);
    return lines.join('\n');
  }

  /** 飞书卡片 */
  function buildCard(order) {
    var count = (order.items || []).reduce(function (s, g) { return s + g.dishes.length; }, 0);
    var elements = [];

    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: '**共 ' + count + ' 道菜 · 6 餐**  ·  点菜时间 ' + timeLabel(order.createdAt),
      },
    });

    (order.items || []).forEach(function (g) {
      var names = g.dishes.map(function (d) {
        return d.name + (d.type ? '（' + d.type + '）' : '');
      });
      var times = (window.MEAL_TIME || {})[g.meal] || '';
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '**' + g.meal + '**' + (times ? '  <font color=\'grey\'>' + times + '</font>' : '') +
            '\n' + names.join('、'),
        },
      });
    });

    if (order.note) {
      elements.push({ tag: 'hr' });
      elements.push({
        tag: 'div',
        text: { tag: 'lark_md', content: '**她留言**\n' + order.note },
      });
    }

    var url = appUrl();
    if (url) {
      elements.push({
        tag: 'action',
        actions: [{
          tag: 'button',
          text: { tag: 'plain_text', content: '打开点菜单' },
          type: 'primary',
          url: url,
        }],
      });
    }

    elements.push({
      tag: 'note',
      elements: [{
        tag: 'plain_text',
        content: '孕期点菜 · 每日食谱  |  ' + GROUP_NAME,
      }],
    });

    return {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          template: 'green',
          title: { tag: 'plain_text', content: order.from + '点了' + order.dateLabel + '的菜' },
        },
        elements: elements,
      },
    };
  }

  function post(payload) {
    return fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json().catch(function () { return {}; });
    }).then(function (data) {
      if (data && (data.code === 0 || data.StatusCode === 0)) {
        return { ok: true, msg: '已发送到飞书群「' + GROUP_NAME + '」' };
      }
      return { ok: false, msg: (data && (data.msg || data.StatusMessage)) || '飞书返回异常' };
    });
  }

  function send(order) {
    return post(buildCard(order)).catch(function (err) {
      return { ok: false, msg: '网络请求失败：' + (err && err.message ? err.message : '未知错误') };
    });
  }

  function sendTest() {
    var now = new Date();
    var order = {
      from: '测试',
      dateLabel: (now.getMonth() + 1) + '月' + now.getDate() + '日',
      createdAt: now.toISOString(),
      items: [{ meal: '午餐', dishes: [{ name: '清蒸鲈鱼', type: '荤菜' }, { name: '杂粮饭', type: '主食' }] }],
      note: '这是一条来自孕期点菜应用的测试消息，收到即代表通知已接通。',
    };
    return post(buildCard(order)).catch(function (err) {
      return { ok: false, msg: '网络请求失败：' + (err && err.message ? err.message : '未知错误') };
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {});
    }
    return Promise.resolve();
  }

  window.FEISHU = {
    WEBHOOK: WEBHOOK,
    GROUP_NAME: GROUP_NAME,
    buildCard: buildCard,
    buildText: buildText,
    send: send,
    sendTest: sendTest,
    copyText: copyText,
  };
})();
