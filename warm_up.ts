console.log("===============ts==================");

// warm up的ts笔记随附代码

// 实现ValueOf<T>，获取对象的value类型，类似于获取key的keyof
// keyof获取对象的key，之后通过[]获取key对应的value
type ValueOf<T> = T[keyof T];

type o_value = ValueOf<{ a: string, b: number }>; // string | number
type o_key = keyof { a: string, b: number }; // "a" | "b"

type tuple = [number, string]
type tuple_value = tuple[0 | 1] // number | string
type len = tuple['length'] // 2
type tuple_type = tuple[number] // number | string

// 类型中的Array
type arr = string[]

type arr_value = arr[0] // string

type arr_type = arr[number] // string


// 实现一个类型数组中的Append<A, T>，在函数中添加一个参数
// 这里extends any[]是为了限制A必须是一个数组
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

// 将元组转换为数组
type TupleToArray<T extends any[]> = T[number][]
type tuple_test = [1, 2, 3]
type test_tuple_to_array = TupleToArray<tuple_test> // (2 | 1 | 3)[]


/// 条件判断
// 实现一个判断是否为number的类型
type IsNumber<T> = T extends number ? true : false

// 实现一个GetProp<K, O> ,若K存在于O中，则返回O[K]，否则返回undefined
type GetProp<K extends string, O> = K extends keyof O ? O[K] : undefined

type test_get_prop = GetProp<'aa', { a: string, b: number }> // string


// 赋值
type getName<User> = User extends { name: infer Name } ? Name : never
// 这里infer Name是一个类型变量，表示从User中提取name的类型
type test_get_name = getName<{ name: 'a' }> // 'a'
type test_get_name2 = getName<{ n: 'a', age: 1 }> // never

// 函数参数赋值
type Params<T> = T extends (...args: infer P) => any ? P : never
type F = (a: number, b: string) => void
type test_params = Params<F> // [number, string]

// 直接赋值
type fn = string
type Fn<T> = T extends infer R ? R : null
type test_fn = Fn<string> // string
type test_fn2 = Fn<never>

// 循环
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
    ? Head extends number // 判断Head是否为number
    ? [Head, ...FilterNumber<Rest>] // 是number时继续递归
    : FilterNumber<Rest>
    : []

type test_filter = FilterNumber<[1, 'a', 2]> // [1, 2]

// 实现返回前N个值，若N > List.length，则返回List
type Take<List, N extends number, output extends any[] = []> = List extends [infer Head, ...infer Rest]
    ? output['length'] extends N ? output : Take<Rest, N, [...output, Head]> // 不等于N时继续递归
    : output // List为空时返回output

type test_take = Take<[5, 2, 3], 1> // [1, 2]
