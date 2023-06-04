class Test {
    idTest: string;
}

class Custom1{
    id: string
    description: string
    count: number

    test: Test
}

class Custom2 {
    id: string
    description: string
    count2: string
    count3: string
}

// Находит разницу в свойствах (которые есть в T, но нет в U)
type DifferenceInProperties<T, U> = {
    [item in keyof U as Exclude<item, keyof T>]: U[item]
}
// или
type T4<Entity, EntityToMap> = {
    [item in Exclude<keyof EntityToMap, keyof Entity>]: EntityToMap[item]
}

// Сравниваем и получем отличающиеся свойсва (которые есть в T, но нет в U и которые есть в U, но нет в T)
type CompareMap<T, U> = DifferenceInProperties<T, U> & DifferenceInProperties<U, T>

// Получаем те свойсва которые отличаются  (которые есть в Custom1, но нет в Custom2 и которые есть в Custom2, но нет в Custom1)
class Mapper1 implements CompareMap<Custom1, Custom2> {
    count3: string;
    test: Test = new Test();
    count: number
    count2: string
}

// Сравниваем свойсва для получения методов которые нужно переопределить для сравнения (которые есть в T, но нет в U)
type DifferenceInPropertiesGetMethod<T, U>= {
    [item in keyof DifferenceInProperties<T, U> as `getMapTo${Capitalize<string & item>}`]: (value?: any) => DifferenceInProperties<T, U>[item]
}

class Mapper2 implements DifferenceInPropertiesGetMethod<Custom1, Custom2> {
    // Свойства которое нужно переопределить чтобы получить Custom2
    getMapToCount2: (value: any) => string;
    getMapToCount3: (value: any) => string;
    getMapToTest: (value: any) => Test = () => new Test();
} 

// Сравниваем свойсва для получения методов которые нужно переопределить для сравнения (которые есть в T, но нет в U)
type DifferenceInProperties3<Entity, EntityToMap> = {
    [item in keyof DifferenceInProperties<Entity, EntityToMap> as string & item]: (value?: any) => DifferenceInProperties<Entity, EntityToMap>[item]
}

type Mapper<Entity, EntityToMap> = DifferenceInPropertiesGetMethod<Entity, EntityToMap> & {getValueToMap: (value?: any) => EntityToMap}

class CustomMapper implements Mapper<Custom1, Custom2> {
    // Методы которые нужно заполнить чтобы получить Custom2
    getMapToCount3: (value?: any) => string = () => "Count3";
    getMapToCount2: (value?: any) => string = () => "Count2";
    
    getValueToMap: (value?: any) => Custom2 = () => {
        return {
            ...this.value,
            // Разные типы данных но одинаковые названия 
            //id: 1, 
            count2: this.getMapToCount2(),
            count3: this.getMapToCount3()
        }
    };

    constructor(private value: Custom1) {}
}


const custom1 = new Custom1()
custom1.id = 'id'
custom1.description = 'descriptiom'
custom1.count = 100500
custom1.test = new Test()

const mapper = new CustomMapper(custom1)
const customer2 = mapper.getValueToMap();

console.log(customer2)

// еще проще через Omit
// Те св-ва которые есть в EntityToMap но нет Entity
type Diff<Entity, EntityToMap> = Omit<EntityToMap, keyof Entity>

// Содержит в себе методы получения свойств которых нет Entity но есть в EntityToMap
type TMapper<Entity, EntityToMap>= {
    [item in keyof Diff<Entity, EntityToMap> as `getMapTo${Capitalize<string & item>}`]: (value?: any) => EntityToMap[item]
} & {getMappingValue: (value?: any) => EntityToMap}

// Содержит свойства которых нет Entity но есть в EntityToMap
type TMapper2<Entity, EntityToMap>= {
    [item in keyof Diff<Entity, EntityToMap>]: (value?: any) => EntityToMap[item]
} & {getMappingValue: () => EntityToMap}

class TMap implements TMapper2<Custom1, Custom2> {

    private readonly custom2: Custom2;

    // Методы которые нужно заполнить чтобы получить св-ва которые есть в Custom2 но нет в Custom1
    count2: () => string = () => this.value.count.toString();
    count3: () => string = () => this.value.count.toString();
    getMappingValue: () => Custom2 = () => this.custom2

    constructor(private value: Custom1) {
        const custom2 = new Custom2();
        custom2.id = this.value.id
        custom2.description = this.value.description
        custom2.count2 = this.count2()
        custom2.count3 = this.count3()
        this.custom2 = custom2
    }
}

const tMap = new TMap(custom1)
const cus2 = tMap.getMappingValue();

console.log(cus2)