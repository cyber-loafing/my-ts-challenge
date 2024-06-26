# Warm Up TS的类型系统
ts的类型系统是图灵完备的，[TypeScripts Type System is Turing Complete · Issue #14833 · microsoft/TypeScript (github.com)](https://github.com/Microsoft/TypeScript/issues/14833)，我们知道，TypeScript 类型系统是“独立”于值系统的存在，我们可以通过映射类型、递归类型定义、索引访问成员类型以及可以创建任意数量的类型，来实现图灵完备。
## TS中的常用类型
1. ts类型基本类型，以及字面量类型和数据结构类型
	```ts
	type Primitives = 
		| number
		| string
		| boolean
		| symbol
		| bigint
		| undefined
		| null

	type Literals = // 区分“字面量类型”与“值”,比如 
		| 100
		| "Hello world"
		| true

	// e.g
	let foo: "Hello world"

	type DataStructures = 
		| { key1 : boolean; key2 : number} // object
		| { [key: string]: number } // Records
		| [ boolean, number] // Tuples
		| number[] // array
	```
2. 将TS的类型看作集合，unknown是全集，never是空集
## Assign Ability
1. 当类型A为B的子集时，A可以赋值给B
2. 任何类型都可以赋值给unknown，never可以赋值给所有的类型
## “值”与“类型”的一种映射？等效？关系
### 函数
函数可以认为是等效的泛型
```ts
const Fn = value => value;

type Fn<T> = T;
```
### 对象
1. 定义：均使用key value pair的方式的定义
	```ts
	const obj = {
		name : "bob",
		age : 10
	}
	
	type Obj = {
		name : string
		age : 20
	}
	```
2. 取值：二者都可以通过obj[ key ]的形式取值，但是TS的==对象类型==无法通过操作符获得值
	```ts
	obj["name"] // bob
	obj.age // 20
	
	Obj['name'] // string
	Obj.age // Error
	
	```
3. 遍历：对于普通的值类型，使用for in即可，对于类型使用keyof Object的方式获取所有的键值
	```ts
	for (let key in obj) {}

	[T in keyof Obj]
	```
### 数组
在类型的语境中，对应“值”语境中的数组的应该是类型中的==Tuple==，就是什么类型都能放

```ts
// 1. 定义
const arr = [100,"H", true]

type tuple = [number, string]

// 2. 取值
arr[1]

type tuple_value = tuple[0 | 1] // number | string
type len = tuple['length'] // 2
type tuple_type = tuple[number] // number | string

// 3. 展开
// 与值类型是一样的使用...即可


// 如果是类型中的数组（Array）
type arr = string[]

type arr_value = arr[0] // string
// 这个也很好理解，number是所有idx（0，1，2...）的父集，因此这里使用number可以获得和idx
// 一致的效果
type arr_type = arr[number] // string

// 实现一个类型数组中的Append<A, T>，在函数中添加一个参数
// 这里extends any[]是为了限制A必须是一个数组
type Append<A extends any[], E> = [...A, E]

type test = [1, string, 3]
type test_append = Append<test, 4> // [1, string, 3, 4]

type Append<A extends any[], E> = [...A, E]

type test = [1, string, 3]
type test_append = Append<test, 4> // [1, string, 3, 4]

// 实现一个Length<T>，获取数组的长度
type Length<T extends any[]> = T['length']
// 实现一个Length+1<T>，获取数组的长度+1
type LengthPlusOne<T extends any[]> = Length<Append<T, any>>
// 或者写成
type LengthPlusOne_<T extends any[]> = [...T, any]['length']

type test_length = Length<[1, 2, 3]> // 3
type test_length_plus_one = LengthPlusOne<[1, 2, 3]> // 4
```
### 条件语句
1. 使用三元表达式
	```ts
	type IsNumber<T> = T extends number ? true : false
	```
	注意这里==extends==的含义是，A extends B代表：A是否可以赋值给B，也就是说A是否是B的子集。因此extends可以在做判断时使用，也可以用在类型约束时使用
### 类似于解构赋值？
在==数值==的语境中，直接使用变量赋值即可，但是在==类型==的语境中就变得复杂了
```ts
const {name, age} = usr;
// 这里infer Name是一个类型变量，表示从User中提取name的类型
type getName<User> = User extends { name: infer Name } ? Name : never
type test_get_name = getName<{ name: 'a' }> // 'a'
```
这里面`infer`的含义在于，为类型<mark style="background: #9BB2FFFF;">变量</mark>赋值，此时`Name`中保存的即为`name`字段的值

> [!NOTE]+  Infer
> infer的作用时推导泛型参数
>  - infer表示在 extends 条件语句中以占位符出现的用来修饰数据类型的关键字
>  - 被修饰的数据类型到使用的时候才可以被推断出来
>  - infer必须出现在extends的右侧，因为必须保证这个已知类型是由右侧的泛型推导出来的
> 
> 在上述中，`infer X`类似于声明了一个变量，这个变量将在随后使用，比如上述`{ name : ???}` 显然这个object类型在`???`处是应该有一个value的，因此使用`infer Name`替代
> 举例: `type Func<T> = T extends () => infer R ? R : boolean;`，即如果泛型变量T是` () => infer R`的`子集`，那么返回 通过infer获取到的函数返回值，否则返回boolean类型


函数的参数也可以通过infer去进行赋值：
```ts
// 函数参数赋值
type Params<T> = T extends (...args: infer P) => any ? P : never
type F = (a: number, b: string) => void
type test_params = Params<F> // [number, string]
```

### 直接赋值
```ts
const a = b

// 直接赋值
type fn = string
type Fn<T> = T extends infer R ? R : never
type test_fn = Fn<string> // string
```

### 循环
在<mark style="background: #9BB2FFFF;">类型</mark>语境中，循环只能通过递归完成
```ts
// 递归遍历数组
type Loop<List> = List extends [infer Head, ...infer Tail]
    ? Loop<Tail> | [Head, ...Tail]
    : never

type test_loop = Loop<[1, 2, 3]> // [1,2,3] | [2,3] | [3] | []

// 实现map
type Mapp<T> = T extends [infer Head, ...infer Rest] ? [{ name: Head }, ...Mapp<Rest>] : []
type test_map = Mapp<[1, 2, 3]> // [{name: 1}, {name: 2}, {name: 3}]

// 实现filter
type FilterNumber<T> = T extends [infer Head, ...infer Rest] 
    ? Head extends number 
        ? [Head, ...FilterNumber<Rest>] 
        : FilterNumber<Rest> 
    : []

type test_filter = FilterNumber<[1, 'a', 2]> // [1, 2]

// 好奇怪的写法
// // 实现返回前N个值，若N > List.length，则返回List
type Take<List, N extends number, output extends any[] = []> = List extends [infer Head, ...infer Rest]
    ? output['length'] extends N  ? output : Take<Rest, N, [...output, Head]> // 不等于N时继续递归
    : output // List为空时返回output

type test_take = Take<[5, 2, 3], 1> // [5]
```