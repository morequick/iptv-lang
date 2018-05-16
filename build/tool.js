var fs = require('fs'),
  path = require('path');

process.title = "语言包转换工具 by devin87@qq.com";

var ROOT = process.cwd(),
  ROOT_EXEC = __dirname;

//输出消息,不换行
function print(msg) {
  process.stdout.write(msg !== undefined ? msg : "");
}

//输出消息,同console.log
function log(msg) {
  console.log(msg !== undefined ? msg : "");
}

//规格化路径
function normalize_path(_path) {
  var pathname = path.normalize(_path);
  return pathname != "\\" && pathname.endsWith("\\") ? pathname.slice(0, -1) : pathname;
}

//判断是否绝对路径
function is_absolute_path(_path) {
  var _path_rel = path.resolve(_path);
  return normalize_path(_path_rel) == normalize_path(_path);
}

//连接路径,若path2为绝对路径,则直接返回path2;若path2以斜杠(/)开头,则返回基于根目录的路径
function join_path(path1, path2) {
  if (!path2) return path1;
  if (is_absolute_path(path2)) return path2;

  path2 = normalize_path(path2);
  if (path2.startsWith(".\\")) path1 = ROOT;
  //else if (path2.startsWith("\\")) path1 = config.root;
  else if (path2.startsWith("|")) {
    path1 = ROOT_EXEC;
    path2 = path2.slice(1);
  }

  return path.join(path1, path2);
}

//创建目录
function mkdirSync(url, mode, callback) {
  if (url == "..") return callback && callback();

  url = normalize_path(url);
  var arr = url.split("\\");

  //处理 ./aaa
  if (arr[0] === ".") arr.shift();

  //处理 ../ddd/d
  if (arr[0] == "..") arr.splice(0, 2, arr[0] + "\\" + arr[1]);

  mode = mode || 493;  //0755

  function inner(dir) {
    //不存在就创建一个
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, mode);

    if (arr.length) {
      inner(dir + "\\" + arr.shift());
    } else {
      callback && callback();
    }
  }

  arr.length && inner(arr.shift());
}

//确保文件夹存在
function mkdir(dir) {
  if (!fs.existsSync(dir)) mkdirSync(dir);
}

/**
 * 将txt语言包转为js语言包
 * @param {string} from_path 
 * @param {string} output_path 
 */
function exec_txt2js(from_path, output_path) {
  if (!from_path) return log('参数错误: 未指定txt文件路径');

  var from_fullpath = join_path(ROOT, from_path), output_fullpath;
  if (!fs.existsSync(from_fullpath)) return log('txt文件不存在: ' + from_fullpath);

  if (output_path) output_fullpath = join_path(ROOT, output_path);
  else output_fullpath = from_fullpath.replace(/\.txt$/i, '') + '.js';

  log('来源路径: ' + from_fullpath);
  log('输出路径: ' + output_fullpath);

  var text = fs.readFileSync(from_fullpath) + '',
    LANG = {};

  text.split('\n').forEach(function (row) {
    if (!row || row.startsWith("#")) return;

    var i = row.indexOf("=");
    if (i != -1) LANG[row.slice(0, i)] = row.slice(i + 1).replace(/\r$/, '');
  });

  fs.writeFileSync(output_fullpath, 'window.LANG = ' + JSON.stringify(LANG) + ';', 'utf-8');

  log('\n转换完成！\n');
}

/**
 * 将js语言包转为txt语言包
 * @param {string} from_path 
 * @param {string} output_path 
 */
function exec_js2txt(from_path, output_path) {
  if (!from_path) return log('参数错误: 未指定js文件路径');

  var from_fullpath = join_path(ROOT, from_path), output_fullpath;
  if (!fs.existsSync(from_fullpath)) return log('js文件不存在: ' + from_fullpath);

  if (output_path) output_fullpath = join_path(ROOT, output_path);
  else output_fullpath = from_fullpath.replace(/\.js$/i, '') + '.txt';

  log('来源路径: ' + from_fullpath);
  log('输出路径: ' + output_fullpath);

  var text = fs.readFileSync(from_fullpath) + '',
    LANG = {};

  try {
    var start = text.indexOf('{'), end = text.lastIndexOf('}');
    if (start == -1 || end == -1) return log('js语言包格式不正确');

    LANG = JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    log('js文件解析失败: ' + err.message);
  }

  var list = [];

  for (var k in LANG) {
    if (!LANG.hasOwnProperty(k)) continue;

    list.push(k + '=' + (LANG[k]) || '');
  }

  fs.writeFileSync(output_fullpath, list.join('\n'), 'utf-8');

  log('\n转换完成！\n');
}

/**
 * 以来源txt语言包为基础,用目标语言包的项填充来源语言包并生成新的语言包
 * @param {string} source_path 
 * @param {string} dest_path 
 * @param {string} output_path 
 */
function exec_txtsync(source_path, dest_path, output_path, mode) {
  if (!source_path) return log('参数错误: 未指定来源txt文件路径');
  if (!dest_path) return log('参数错误: 未指定目标txt文件路径');

  var source_fullpath = join_path(ROOT, source_path),
    dest_fullpath = join_path(ROOT, dest_path),
    output_fullpath;

  if (!fs.existsSync(source_fullpath)) return log('来源txt文件不存在: ' + source_fullpath);
  if (!fs.existsSync(dest_fullpath)) return log('目标txt文件不存在: ' + dest_fullpath);

  if (output_path) output_fullpath = join_path(ROOT, output_path);
  else output_fullpath = dest_fullpath;

  log('来源路径: ' + source_fullpath);
  log('目标路径: ' + dest_fullpath);
  log('输出路径: ' + output_fullpath);

  var text_source = fs.readFileSync(source_fullpath) + '',
    text_dest = fs.readFileSync(dest_fullpath) + '',
    with_source = mode == 'fill',
    LANG = {},
    output = [];

  text_dest.split('\n').forEach(function (row) {
    if (!row || row.startsWith("#")) return;

    var i = row.indexOf("=");
    if (i != -1) LANG[row.slice(0, i)] = row.slice(i + 1).replace(/\r$/, '');
  });

  text_source.split('\n').forEach(function (row) {
    if (!row || row.startsWith("#")) return output.push(row);

    var i = row.indexOf("=");
    if (i == -1) return output.push(row);

    var key = row.slice(0, i), value = row.slice(i + 1).replace(/\r$/, '');

    if (with_source) output.push('#' + row);
    output.push(key + '=' + (LANG[key] || value));
  });

  fs.writeFileSync(output_fullpath, output.join('\n'), 'utf-8');

  log('\n同步完成！\n');
}

function exec_txtsplit(source_path, output_dir, split_num) {
  if (!source_path) return log('参数错误: 未指定来源路径');

  var source_fullpath = join_path(ROOT, source_path);
  if (!fs.existsSync(source_fullpath)) return log('来源文件不存在: ' + source_fullpath);

  var output_fulldir = join_path(ROOT, output_dir);

  split_num = +split_num || 200;

  log('来源路径: ' + source_fullpath);
  log('输出目录: ' + output_fulldir);
  log('单文件语言项数量: ' + split_num);

  log('');

  var text_source = fs.readFileSync(source_fullpath) + '',
    outputs = [],
    output = [],
    c = 0;

  text_source.split('\n').forEach(function (row) {
    if (!row || row.startsWith("#")) return output.push(row);

    var i = row.indexOf("=");
    output.push(row);

    if (i != -1) c++;

    if (c >= split_num) {
      outputs.push(output);
      output = [];
      c = 0;
    }
  });

  if (c > 0) outputs.push(output);

  if (fs.existsSync(output_fulldir)) {
    log('清理输出目录: ' + output_fulldir);

    fs.readdirSync(output_fulldir).forEach(function (filename) {
      var fullname = path.join(output_fulldir, filename);
      try {
        fs.unlinkSync(fullname);
      } catch (err) {
        log('文件删除失败: ' + fullname + '  =>  ' + err.message);
      }
    });
  } else {
    mkdir(output_fulldir);
  }

  console.log('');

  outputs.forEach(function (output, i) {
    var fullname = path.join(output_fulldir, ('00' + (i + 1)).slice(-2)) + '.txt';
    log('写入文件: ' + fullname);

    fs.writeFileSync(fullname, output.join('\n'), 'utf-8');
  });

  log('\n分割完成！\n');
}

function exec_txtjoin(source_dir, output_path) {
  if (!source_dir) return log('参数错误: 未指定来源目录');
  if (!output_path) return log('参数错误: 未指定输出路径');

  var source_fulldir = join_path(ROOT, source_dir);
  if (!fs.existsSync(source_fulldir)) return log('来源目录不存在: ' + source_fulldir);

  var output_fullpath = join_path(ROOT, output_path);

  var output = [];

  fs.readdirSync(source_fulldir).forEach(function (filename) {
    if (!filename || !filename.endsWith('.txt')) return;

    var fullname = path.join(source_fulldir, filename);
    log('读取文件: ' + fullname);

    output.push(fs.readFileSync(fullname) + '');
  });

  console.log('');
  log('写入文件: ' + output_fullpath);

  fs.writeFileSync(output_fullpath, output.join('\n'), 'utf-8');
  log('\n合并完成！\n');
}

var map_action = {
  'txt2js': exec_txt2js,
  'js2txt': exec_js2txt,
  'txtsync': exec_txtsync,
  'txtsplit': exec_txtsplit,
  'txtjoin': exec_txtjoin
};

function init() {
  var action = process.argv[2];

  if (!action) return log('参数错误: 请指定转换类型');

  var fn = map_action[action];
  if (!fn) return log('参数错误: 不支持的转换类型 => ' + action);

  fn.apply(undefined, process.argv.slice(3));
}

init();