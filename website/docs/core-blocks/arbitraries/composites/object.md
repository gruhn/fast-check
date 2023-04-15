---
slug: /core-blocks/arbitraries/composites/object
---

# Object

Generate object values.

## dictionary

Generate dictionaries containing keys generated using `keyArb` and values generated by `valueArb`.

**Signatures:**

- `fc.dictionary(keyArb, valueArb)`
- `fc.dictionary(keyArb, valueArb, {minKeys?, maxKeys?, size?})`

**with:**

- `keyArb` — _arbitrary instance responsible to generate keys_
- `valueArb` — _arbitrary instance responsible to generate values_
- `minKeys?` — default: `0` — _minimal number of keys in the generated instances (included)_
- `maxKeys?` — default: `0x7fffffff` [more](/docs/configuration/larger-entries-by-default#size-explained) — _maximal number of keys in the generated instances (included)_
- `size?` — default: `undefined` [more](/docs/configuration/larger-entries-by-default#size-explained) — _how large should the generated values be?_

**Usages:**

```js
fc.dictionary(fc.string(), fc.string());
// Examples of generated values:
// • {"<H":"`D? &7A","T>X0Aa]tp>":":5+|","8{0.mI>8R,":"j._[Xi&.[","!83F]'E1_":"y[bB,G$_S}","NnY,!{":"6NZ4,G'}","Y&>Uj":"gg@eTi","e>QDNvD/gz":"Bt0&oV;","ULLW1":"F6i_","?&I":"lPd7}"}
// • {"_":" y|","Yo+\"O@q+j":"cI{H","":"3#$}9{5!z","?^~k ":"w$defipro","[fa4c":"J"}
// • {"~":""}
// • {"lzproperty":"?"}
// • {"hOIY\"R q}":"W","l__defineG":"8x`:H0?T"}
// • …

fc.dictionary(fc.string(), fc.nat());
// Examples of generated values:
// • {"":11,".[hM+$+:?N":30,"%{":59342696,"|_":29,"E":670852246,"pl_":2147483639,">":2147483630,"M7cU?#9":1072636200,"ot":1627183273}
// • {"_G@>x":461241683,"@9c=&6H:c0":105089967,"c_)r66nwK":1355210745}
// • {"#1O;mZ1":1005073225}
// • {}
// • {"6":144134225,".9":437743867,"tR?j$Hat3X":1920000943,"DQTd":324814916}
// • …

fc.dictionary(fc.string(), fc.nat(), { minKeys: 2 });
// Note: Generate instances with at least 2 keys
// Examples of generated values:
// • {"%{":11,"4cH":12,"ke":2147483622,"rqM~i'":485910780}
// • {"K":1498847755,"&cP<5:e(y\"":1430281549,"!\"2a":1631161561,"dY+g":1880545446,"M2+^,Yq7~t":1437539188}
// • {"NfXclS":815533370,"?":2060844890,"":1862140278,"R":618808229,"N|":25902062,"DGw00u?brK":348863633}
// • {" R~Own":2147483645,"~":16,"i$#D":1037390287}
// • {">YTN<Tt":1950414260,"I6":1505301756,"2;]'dH.i!":815067799,":kmC'":1948205418,"g|GTLPe-":2101264769}
// • …
```

Resources: [API reference](https://fast-check.dev/api-reference/functions/dictionary.html).  
Available since 1.0.0.

## record

Generate records using the incoming arbitraries to generate its values.

It comes very useful when dealing with settings.

**Signatures:**

- `fc.record(recordModel)`
- `fc.record(recordModel, {requiredKeys?})`
- `fc.record(recordModel, {withDeletedKeys?})`

**with:**

- `recordModel` — _structure of the resulting instance_
- `requiredKeys?` — default: `[all keys of recordModel]` — _list of keys that should never be deleted, remark: cannot be used with `withDeletedKeys`_
- `withDeletedKeys?` — default: `false` — _when enabled, record might not generate all keys. `withDeletedKeys: true` is equivalent to `requiredKeys: []`, thus the two options cannot be used at the same time_

**Usages:**

```js
fc.record({
  id: fc.uuidV(4),
  age: fc.nat(99),
});
// Examples of generated values:
// • {"id":"0000001b-000b-4000-8000-0000ab45c359","age":1}
// • {"id":"9de2ca04-dc68-4c3f-87e4-e878407827d6","age":98}
// • {"id":"12bb661f-b57a-4d8c-8407-719100000002","age":99}
// • {"id":"ffffffe3-0013-4000-a7d5-d5734251f8d2","age":0}
// • {"id":"00000007-000a-4000-8000-00170000000e","age":5}
// • …

fc.record(
  {
    id: fc.uuidV(4),
    age: fc.nat(99),
  },
  { requiredKeys: [] }
);
// Note: Both id and age will be optional values
// Examples of generated values:
// • {"id":"2e2abe58-e8a4-4d10-a73f-159cffffffef","age":3}
// • {"id":"0000000e-89b6-4af4-b8e3-20860000000f","age":60}
// • {"age":4}
// • {"id":"111fd173-0015-4000-8000-0002fffffff7","age":80}
// • {"age":0}
// • …

fc.record(
  {
    id: fc.uuidV(4),
    name: fc.constantFrom('Paul', 'Luis', 'Jane', 'Karen'),
    age: fc.nat(99),
    birthday: fc.date({ min: new Date('1970-01-01T00:00:00.000Z'), max: new Date('2100-12-31T23:59:59.999Z') }),
  },
  { requiredKeys: ['id'] }
);
// Note: All keys except 'id' will be optional values. id has been marked as required.
// Examples of generated values:
// • {"id":"353f1f6d-a3c8-4edb-bb93-fd3d3e9ed455","age":0}
// • {"id":"00000005-c3c7-446e-8944-b53cfffffffb","name":"Jane","age":0,"birthday":new Date("1970-01-01T00:00:00.034Z")}
// • {"id":"d1a730bb-fff1-4fff-9128-b8fdfffffffd","name":"Karen","age":83}
// • {"id":"43d4f5d7-6e17-4e8a-8615-57c1827ba780","name":"Luis","age":6,"birthday":new Date("1970-01-01T00:00:00.033Z")}
// • {"id":"4878ef64-8ff1-46ee-bfff-fff3ce0e00f3","name":"Luis","birthday":new Date("2089-09-02T00:07:56.667Z")}
// • …

fc.record(
  {
    id: fc.uuidV(4),
    age: fc.nat(99),
  },
  { withDeletedKeys: true }
);
// Note: Both id and age will be optional values
// Examples of generated values:
// • {"id":"00000000-ffea-4fff-8dcd-9c140000001f","age":85}
// • {"id":"00000014-fffa-4fff-8000-00135662280d","age":30}
// • {"id":"0000000d-d108-4692-8000-000a00000006","age":3}
// • {"id":"00000002-4b97-4f5a-bfff-fffa0e7b2b56","age":36}
// • {"id":"84ce9c18-0007-4000-b220-f0cc5899ac88","age":96}
// • …
```

Resources: [API reference](https://fast-check.dev/api-reference/functions/record.html).  
Available since 0.0.12.

## object

Generate objects (key/values).

**Signatures:**

- `fc.object()`
- `fc.object({key?, depthSize?, maxDepth?, maxKeys?, size?, withBigInt?, withBoxedValues?, withDate?, withMap?, withNullPrototype?, withObjectString?, withSet?, withTypedArray?, values?})`

**with:**

- `key?` — default: `fc.string()` — _arbitrary responsible to generate keys used for instances of objects_
- `depthSize?` — default: `undefined` [more](/docs/configuration/larger-entries-by-default#depth-size-explained) — _how much we allow our recursive structures to be deep?_
- `maxDepth?` — default: `Number.POSITIVE_INFINITY` — _maximal depth for generated objects (Map and Set included into objects)_
- `maxKeys?` — default: `0x7fffffff` [more](/docs/configuration/larger-entries-by-default#size-explained) — _maximal number of keys in generated objects (Map and Set included into objects)_
- `size?` — default: `undefined` [more](/docs/configuration/larger-entries-by-default#size-explained) — _how large should the generated values be?_
- `withBigInt?` — default: `false` — _enable `bigint` - eg.: `1n`_
- `withBoxedValues?` — default: `false` — _enable boxed values - eg.: `new Number(5)`_
- `withDate?` — default: `false` — _enable `Date` - eg.: `new Date('2020-10-14T16:52:36.736Z')`_
- `withMap?` — default: `false` — _enable `Map` - eg.: `new Map([['key', 'value']])`_
- `withNullPrototype?` — default: `false` — _enable objects not defining any prototype - eg.: `Object.create(null)`_
- `withObjectString?` — default: `false` — _enable strings looking as string representations of JavaScript instances - eg.: `"{}"`, `"new Set([1])"`_
- `withSet?` — default: `false` — _enable `Set` - eg.: `new Set([1, 2, 3])`_
- `withTypedArray?` — default: `false` — _enable typed arrays for ints, uints and floats - eg.: `Int8Array.from([1, 2, 3])`_
- `values?` — default: _booleans, numbers, strings, null and undefined_ — _array of arbitraries producing the root* values - *non-object ones_

**Usages:**

```js
fc.object();
// Examples of generated values:
// • {"T>\"C9":false,"yHBAjk":{"<uc'a%TWVL":undefined},"\\7PeD/-o:":true,"PW'CFh3Pw":[-7.214519610151173e-299,false,true,null,2030234130078961,null,-8273957629958170,"",undefined,-8.179494320148384e-94],"2$1~":[-3282804867866377,false,4298380906242337,[[7564146043215021,"VYH","h","",false,"%ds7#kDfYS",3.578123265927531e-219,-354088372170986,-2613507181137057],"U,pa$"]],"3W":[-6.675234143629247e-99,"vV 'iQL3",[true,true],"",-5.0163002484267276e-251],"4A B6S":-8850782960808458}
// • {"]iD\"27;N":"Q2znA<",">|{G|F':f":[-3.4364134630258427e+167],"::n|?y1":false,"D#\"qgM":["{?Ug/mu`y",4099389896444517,2.8106429365287123e-290,"D0u7f\\wL4",true,"go\"+a'h~","4~SPYw","}5nUz@cu",false,2.653699048373951e+52],"A*]4kR#":[3.077678585699057e-191,":."],"<{zL{GS_df":{"Kr/`":{"-<":true,"{;L>~A?+b":{":flM\\Ds":-5869183493605743,"":"pH"}},"C8iO":false},"w;c[ifHPI":[null,-1832455907117025,"46q)#d^l1&","",-5.074102272041778e-260,3155691818471737,false,-2142427046048884,"$vG2"],"":2792379101188081}
// • {"(TjI84":{"!ax5yBXr#":1.7962464671949172e+244,"H3C1OZ-CE`":undefined,"bB^5Yz!cI":["*Wn,'",7.690509123279207e+227,undefined,5852017543054509,1.0974361021126729e-16],"1!Tq":"Y"}}
// • {"\\YeS$":true,"\\Cx>":[null,undefined,5667732388716951,"r:-4=`eKn",true,undefined,-1.0161624651353362e+89],"kwF$1q'lm\\":undefined,"":7427664738904881}
// • {}
// • …

fc.object({
  key: fc.constantFrom('a', 'b', 'c'),
});
// Note: Keys in ['a', 'b', 'c']
// Examples of generated values:
// • {"a":5434039340410617,"c":"6C&YYy&I"}
// • {"b":[[undefined,null,undefined],["M?",-5580220830100695,"-",false,1.0406508739549715e-195,undefined,",<]u[K6BWe",7191393626793647,true],"xlSjDQL"],"a":[{"c":null,"b":-3.31044629414266e-203},[5.08501079708449e+64,true,"To7_sk",-7813867695183313,undefined,-2.6288856620187387e-300,true,"opc$","},.h%"],"_aa%]B"],"c":""}
// • {"c":[null,true,-5103135698626634,true,8.640826035376584e+129,"BQxVJft(?",-1.5564132973251761e-224,-8751473183072760]}
// • {"a":null,"c":":M2(J"}
// • {"b":[],"c":true,"a":{"c":undefined,"a":1.4812341361081706e-90,"b":3.0694085912031733e-265}}
// • …

fc.object({
  maxDepth: 0,
});
// Examples of generated values:
// • {}
// • {"":-2661215485674034,"xc\" _":5.122556662839035e+30}
// • {"EjK.b?^O":"D1$L","zDJWs":"","s ":true}
// • {"":"","r ":"f96g[G4Ta","Lo":-9007199254740982,"y?D0":-4.029795204858185e-145,"{k\"":"4Eg!e$X&!","!#\"{;[r|":true,"ElpSy!":undefined,"N_/?":"3|OB->","Ur!\"":8.561972111917054e-150,"whbHaYv(9":undefined}
// • {"i<\":q":-2.6171334135337624e-291}
// • …

fc.object({
  maxDepth: 1,
});
// Examples of generated values:
// • {}
// • {"":{"7xc\" ":"pU","`2ce{'@$":"rT0u2Fz","=\\MDU^x?F":-1634219774646683,"=C_`":":p","5r&":"UHG\"<N"},"9DK]":true}
// • {"EjK.b?^O":{},"D1$L":{"JWsn":" 9%Gp.m0N|"},"?8,E(":{"p7*8>":"O","d!R":"vUwQTwv","Jk<?]Q4kiz":"t9sE;","/a70Mu$":1.553810706514351e-293,"u?*":"};Q4%","":-1.6909038094436722e+50,"jlh42":-1.5681604359387257e+267,";\"OH=dAQ":true,"U<SYe":-6.243528612631655e+287,"_":"q\\b%5"}}
// • {"":{},"r ":{"f96g[G4Ta":3507520577650897,">":null,"-d%v":"YBz[cn","<0u\">P":"?D","1! oW":true,"\\7q5":false,"zx":-3977761363413685,"_":true,"@gK7^Ue YJ":false,"<T.o":-7480996801782140},"y$ );[":-1.7976931348623111e+308,"v&ElpSy!8":{"_/?==2^3|O":null,")[uv*IokV}":" rn(#c","A6[":undefined,"":-7486588236535470},"$1$#S?&Q":5675817337610269,"Z":{},",\"S":[],"F":{"10":-6578471272860074,"djr%&u9k":9007199254740988,"Q9$%":-9007199254740972,"_Ziwm4T":"$__prot","WgRxy<]":true,"?k@":null,"!^!":-2.57e-322,":NCTp":-8325747361775351}," &HDDGxQP":["Mfwc!n",true," g\"",true,5924336580000517,-2.87e-322],":,":{"nXS#E":false,"bi":-9007199254740972,"":"6","W#/":false,"Ls^d:;":-9007199254740954,"i~$s&":true,"key":2.1892316382848086e-97,"n":"Oc&z\"P0","8\"W{q":7287039842698893,"~Bl!":-3.7948918096071375e-76}}
// • {"i<\":q":-1e-322}
// • …

fc.object({
  withBigInt: true,
  withBoxedValues: true,
  withDate: true,
  withMap: true,
  withNullPrototype: true,
  withObjectString: true,
  withSet: true,
  withTypedArray: true,
});
// Examples of generated values:
// • {}
// • {"!}~":{"9&*>":9494705766050126970059458547134765572232472890999989593960442554603045184030n,"36196779627093044303215052719752706352981292536045008449906200395046789418178n":true,"__:^bAM'":new Boolean(true),"u k%":1596443377842537,"new Number(-7049375787334476)":new Number(7.470701818813003e+220),"<":"PW#NZ]>__$","?,f+":30002898913267044193974323334546082038810289464813171141565449175457493043927n,"vj`:X\\a":new Date("+046542-01-18T09:38:40.580Z")},"Gp":new Map([[{"I#cPI;!":new Number(-3e-323),".I&N":false,"as":32401686191943328701373790805636534760611537151552234790087877880448748089108n},{["__proto__"]:[false,-7406733250570661812141992739047378682862933477383691956802999676905441418611n,undefined,-1.8548663874469867e-196]}],[Int8Array.from([85,-97,91,-30,-92,78,37]),new Map([[new Boolean(false),8.709846967985125e-190],[undefined,"7u{"],[new Date("-255125-03-27T00:17:42.101Z"),"1?Ml0,%1g`"],[true,"QsA$f=Ee]"],[new String("Xy\"('68gc/"),true],[new Number(1.90820065201078e-112),null],[null,-1.0837607254270806e+62],[4.575964284597119e-159,new Number(1887222873233811)]])]]),"$lfocalekv":new Set(["new Number(-2.8e-322)"])}
// • {"~OSo:":{"lG.+,iSMR":Object.create(null),"UpT":new Set([-8406062966618675,7988617581241407,"Sh`Vm",new Date("+212485-12-17T05:31:30.878Z"),false,new Boolean(false),true,new Date("+223122-12-27T20:25:35.408Z"),new Date("+146473-11-26T14:43:03.460Z"),1.283799274115683e+40])}," va":{">WpD":new String("^"),"`=yg":null,"/hv|pK":-3297758507882496,"uvm\\h*e":new Boolean(true),"4=<":new Boolean(true),"b":new Boolean(true)},"t1]%\"@bU":Object.assign(Object.create(null),{"g{WFqXV`":new Set([new Number(-1.7808734162970381e+199),"[]",2.9945390031403135e-57,new String("m22>B0E")]),"":Int8Array.from([40,-86,-28,74,-25,79,-86,51]),"6dYXYDs$":[new Date("-230687-12-11T17:10:48.506Z"),undefined,new Date("+253296-08-04T11:22:14.526Z"),-5697064682811231230607668449796892759150107852056728380451644440780672718521n,new String("&D!~b2+K,L"),34112792392140757735808259705664111791041643531782909535770237858684045298587n]}),"um":new Number(1.4965882319787918e-217),"IncsTa`B":[true,2.5209616051404463e-17,new String("-"),true,true,-7.483766224651158e+219],"key":new Map([[";J/oZ4",false],[".",new Number(1.6838213802116993e+89)],["L xzXD(9",new String("*W:KvE")],["5.388106931016453e-187",null],["a9Io",new Date("-239138-10-27T16:50:03.030Z")],["",new String("+WQ1Qs")],["{\"Mj:\":\"4.t.\\\\sy8.\",\"Bnt=\":new Map([[\"2\",\"\"],[\"?g:YWy7U;\",null]])}",-7.198743714819896e+40],["P",undefined],["{%l",new Boolean(false)],["G6A '",20672845244493053706744809215533796309742679249201057641622417266125447658602n]]),"=":new Date("+242533-07-13T15:53:24.130Z")}
// • {"m":new Boolean(false),"GdKtb5":[{},"-bD0!MW%",new Number(7766897677764529),4176690198074207],"":new Number(3627693991586841),"a.d^\\Gf":"{\"{\\\"m};\\\\\\\"h\\\":\\\"5->\\\",\\\"-8752641449913448\\\":639891364842017,\\\"c\\\\\\\\ oN,#\\\\\\\\h\\\":new Date(\\\"+251205-04-13T18:02:44.172Z\\\"),\\\"+*q2E,zx|\\\":\\\"Ve2P@nw\\\",\\\"QU81JO\\\":new String(\\\"|x}.YY\\\"),\\\"8#3AOzyS(>\\\":new String(\\\"8!G\\\"),\\\"S?Q4OroZ\\\":\\\"Pz0VDF\\\\\\\"\\\",\\\"?`LD=4*Y0{\\\":new Boolean(false)}\":null,\"j\":new String(\"*+m}\"),\"F5<]($n\\\"i\":1.465304313466093e+108,\",XWj\":\" I{\",\"j<k@bt0\":16300859168088754509925413268318349643282965303942864666117356523207842479374n,\";V kf_0\":new Boolean(false)}","k\\]*Y_N6E":{"[undefined,new Date(\"+215025-08-20T06:54:50.126Z\"),new Date(\"-189344-06-22T19:33:16.770Z\"),new Number(-4.510648064964525e+40),new Boolean(false)]":Int16Array.from([-21146,15304,-22324,-4489]),"n=al?SUz":"-18192254609816222871942212017157656758681609242794550055861899941410368412434n","Uint32Array.from([2468659646,4210830167])":[[new Number(1733142871583037),new Date("+138264-04-14T20:56:39.474Z")],null,"ZL",true]},"'gfs":[-2.4994803248797238e-257,4878802734533453,new Map([[new Date("-167947-07-29T13:49:29.006Z"),false],[new Number(1173672746134665),new String("jrh*F\"]")],[null,new String("1WA3-Q.dfh")],[1.1499097510701588e+108,null],[new Boolean(false),new Number(3.1953519717235633e+159)],[8.171692322416882e-56,""]]),"-a5",new String("<;Y@89&"),new String("K|")],"!Ns$Uc|m":{" qP!fXw":"{zv#4\\k/T","lDyfks":null,"":new Number(-2.4436654725206056e-191),"F":new Boolean(true),"X`3xgaqe`":"","L":true,"T!kpYb":null,"/":null,"`A+W\"lX.]":-3473510705577964,"#":new String("+sC")},"9Q2dg{gw25":Int32Array.from([1117916678,-404321370,-1339202740,2040946564,-1626961973,-2127520125,-1514783970,-818153124,224109024,660336252])}
// • {"K]+.i1?8":{"":new String("gn5>okAG"),"Z":new Number(-2.8857611508988743e+276),"6{;":new Number(8248181823478789),"o\"u":"$@ ","}":"aMbtvs7C=/","T":"","de9@I1lMI":-2.8706407111120148e-269,"*":false,"mC":new Number(7.989425170759711e+195),"?GwV~":new Number(-457340909318629)},"`Kvs&":")VO*,P^NYG","vk.:":new Map([[undefined,"Z.}hrC`Hc"],[[new Boolean(false),new Date("+052983-02-28T02:31:09.364Z"),52143598874765264701371431079292844141908445045351459605282591631609236831998n,true,-38876394190769677360892268452512578808013504347552397336926989157734923198185n,new String("PG]4")],new Map([])],[-3872103416810314,-28212303014774718117521390258838258697709891611727594618513831728955896270794n],[new Number(-8661511263461609),2877012388369579892369485268676177182562561078881057531177474431857917293933n],[null,1311124694155425],[false,{"u-U":null,"m{Gy5kYQs}":false,"/B":undefined,"gI":-31417744997432527155816002698329787788836871244498252206901571508529573329138n,"(sO!Xj&HZ":-38064029319408931658349940753349752515936876372811456495471219646498472196160n,"f+XW\"cJPz":new Number(-6919656271089809)}],[new String("%6\"!-"),new Boolean(true)]]),"xS5":Uint32Array.from([4008006568,1779985549,2496370087,2914891672]),"bH<S@)>":"new Number(3.8099502783268006e+299)"}
// • …

fc.object({
  depthSize: 'medium',
  maxDepth: 1000,
});
// Note: For the moment, we have to specify maxDepth to avoid falling back onto its default value
// Examples of generated values:
// • {"jlRI2'7":[[-3.6634432860547786e+51,{"7m=0":"&fz",")!":[undefined],"N":null,"I=u8m^VR":{"S29":undefined,"b:<?mCQkVd":8.940058015250812e-271,"qAHv?":"P:w<OcJP","Q4ZF|M":108779479352173.86,"!)!UV~9":false,"I3<aagCu9":-590557752051460.5,"y":false,"u<*Y#T@Y3":8165685034312269,"<W;Qzu8":"&%Xv","V":null}},-3.121430328628285e+162,undefined],["","phW",-1.9464950299309262e-17,-4.226362328068501e-212,3.1522566190934685e-186],{"4":1.3897601044135302e-295,"}nkw<.)":false,"8h9gD":true,"r<!":true,"]f/sR%^9Hj":"H&)","cHm kh":[-4.396365385982941e+29,8089452988759541],"wln.":{"Ahv<l]:|":undefined,"w*OEhL":-1.1354700894005589e-291,"W39)u&":true,"":true,"SX4e'Hj":false,"G\"yRzF":false,"\\,tcQ6$#j":"zCGHb]","yvRw":undefined},"":-3.8760248323787517e-97}],"{?F(":{"R\\94!x6Q":[[],{"i@iro5[fKd":{"Pq*;vr;c":3433121904518719,"E((9PS":"5|Tp","y/Jo0":false,"{\\F8{l":true,"3@9J1{9?b4":{"JqLj#8%IVM":-4.345111006146924e-119,"E#h ":-1.4458501693886183e-53,"Z":null,"ek":7.627014306073162e+35,"":5211735920391165,"b":"#T"},"Q.$%&J*hg1":true},"MWBjU":-5998627330219094},{"99\\QXu]D_":0.049788359044109755,"|< 0vgmqeG":",","":true,"r=QT":6.720558051229312e-144,"G++i!hk@":4647057243076279,"E&ng)(~G":-4.1051239898293556e-219,"JtBUMq":null,"q`kX22":""}],",0sD":[-2291925253002477,-3680809186684411],"d>}":{"WPP5*6Cr":{"\"1":null,"2)T":-8377951956507916,"9HF3{V8tEb":2280334561885641,"!$%Rey@}":2528584674341843,"d^!9":"8@$-sOGr",":-?}' ":"u@f","qP":-4245571069522892,"NFS,v8,3B":"~fdG,gkK3"},"/G;o":[null,-8242886212680521,-6105795529017969,2.4795920784861635e-58,true],"|W*45":"","@/:$YWe":true,"h[&":-7.300258930257669e-188,"zj=S68":697925372625389}}}
// • {"<6Fmm`4}Bu":[{"wimM?[D_l":"-"," cLYEh":undefined,"~M=,<]":undefined,"":{"+5V>":true,"x'xlSjDQL":[1802778402004233,-8616465840854132,true],"eG?2W":false,"y":undefined,">sMsRX 6y":-1.7189385776940326e-264,"SS%K~_":-1.0690658255104117e-299,"0WR\\L":false,"#}D{":""},".Df)X2<":-2202090815862342,"HZd+N":[undefined,{"C_H~4X4q":2709965599750143,"Qz2":null,"[*~=DXH":"yZi"},undefined,":L=\\O","5UeV}~.'",-3.31044629414266e-203,false,false],"*a@K.To":[false]},false,["Gmfz&O=K2o",-7.403319311837875e+241,[-3.0613655782090207e-27,true,"a%]B","","b9x}"],null,4179679971001965,{"~Ve#ZG6Mb":null,"i:SSd7":null,"Jf4P2mz":100760271.13220443,"W)k":"zI&n-d(wbC"},undefined,-7286446844918941,-4.039967891793219e+56,1906820233849569],296844346754593,{"S5rX+-":[-1.1392462164399509e-198,[-9.535024608921826e-271,"Gq;"],true,undefined,3.5981254940269306e+81,"T)c')v9r\"A","oO5oP+'",":M=m",-3.944166286120164e+33,-6205742952976482],"YTl":undefined,"I<,TFUmM":{"&A$":{"oKj$u2ew":-775022.3461122828,"fF^|`":"+8a:]/|E?","$/Mx":"`","U'SU4y9WL":{"DR(Vw":"sp^5@HyTyg","\"x":{},"=DrKR^41":":eTPKH{|","/Jw.":"4*2.d43","XX0jo":true,"8I+]uE,~f!":"KU","U#XUyT":null,"}]0G`S":false,"R":8685784240008809}},"":1.620440900490254e-107,"rD8XT^&[Z|":[],"gXifr1xy":[true,true,false,undefined,-2.6592975170538685e+219,-7514943573617259,4.4832607392026617e+86,4960815038961037,"W3=9"]}}],"_":[[],{"^B!_l":"/D[S5Z2zWA","jfZ":"F$uvKnq","Lguy)#r_IX":1.2359628335811745e-97,"1;":3821770058210129},-6.904446105243352e-71,-1.0297835727619694e-278,-3.5748966927106464e-37,"JVd6D|",347573441937437,-2.359579050814135e+229,false],"G2jJT":{" ":[2.951809015572984e+77,".H:K~5Wa",7.880546788741649e+254,"#I5H XXI",-256426800988548,"'U|*?Z{R","@xJ]",undefined],"o=P":{",lv,|":{"Qn":{"f\\bt0%":[],"4pdV~v":"tx8>?nX","m1<<":[false,undefined]},"zAzTM_<Pw":-5.140247429260173e+64,"p":{"iiQQ43":-3035959157448065,"o":true},"8IXbO":2.6967794816849864e+174},"R\\Jgqd":"","P5/1GS5P|r":"Hl~Qiu>"},"":{"":{"O<}lhD_VJ":"KRa",">ARE|":2.105709110120377e+291},"mt-5CHw":[7281056895309909,undefined,-1.0832106067775677e+83,"n",1.1148533710500072e-144,undefined,9.612492054183178e+254,{"w^7m1":"x","gAJ":1216468896413103,"3P.":undefined,"lH`PK3XT":true,"M":true,"V'$":1366229033719073,"":-5449296540214400,"dDV4":"aN-1$oz","o`6":"sf1J9i@[<","7IQ!VE)":"oRO6+-@-4"},-6617712369339759,false],"!J%w/m":true},"bM\"!Z":false,"9}/":{"U/N0":-8.797962526796922e-300,"Ians":"_<d"}}}
// • {"QP~oe^k":{"":-6.297226029379872e-90,"nTBQxV":["&JgF{Ts",-2.2023434094817895e+57,"}",{"J[G5),H":2896817514483901,"+;.1i@":"3_AK_j3Me","Wr":5040983497678121,"":null,"y":"T","(3w|Ctz":"m?(hO3U]U","7,-Dk":1.097665475704934e-37,",e'\"`":-1.3824131271867126e-137,"+":true,"sT{T U":"jrWM)PTK4"},"ShcW"],"Uy":[[2.77e-322,2.3e-322,true,"*?C?",{"09gDr)":-6631066354524675,"abW0O`G7w":1.7975641982015258e-218,"24R2wI@m8":-1.4231998566419938e-152,"":"'(yHIDy8.","iJhH@CoZI":-9.306087735675537e-117,"[~Su5uc":true,"c2>U#O#":-2.554930250476925e+50}],9007199254740989,{"7":false,"1)eo[:ZLR":-1680458957018741}]}}
// • {"Qynb2&R:":"kprototy","S/zpO]":-6.610312155890988e+164}
// • {"gIkH":{"M5R7w_$C0":false,"":"2hHGwqBi]","4?NZ(<btD":" ","tb":null,"[tE~r,Tp":3272117996070697,"9% ;$":{},"gdZ7p.rOM":-1.8456309562500985e+216,"nnTx}3z+B":true},"8$":[{"@p3P":{"`%:j4)tY":"[/RpNyjA8","F;>I\"l0!1":"}1","-yFgaGXx":undefined,"O":false,"MSxw E&*":2053216282867765,"gU$Tvn:":6468393373138605,"N":false,"\\EZq71Vg^g":-7351123399757278},"N.F!HH+u%":[]}],"]{\\s~Bq":{":=u^*,k<e":{"Z":-2.943842010162528e-293,"QB":[undefined]},"kJ&t":[],"bJVUgr{%4_":-2229105556514824},"L":{},"CjiJ,/q;S":{"wYd/nde0":[-7641753278026031,-2.3215299537372015e-307,{"#VlxP":".o9D##","Xr1BGSJ":"\\\\sy]h"},8501134920229827,"e Ok` 1(",48256.5854714529,"J-"],"(n":undefined,"n+ABlR":"k ","q3":{"L}h]4*9>N@":8318651930088765,"UD+Lz6":" 4","":-5138984880950414,"i":true,"pL\\w":"<9","z3M6\"X -":1.3642276018956944e+61,"uqHu":9.837488911132902e+60},"v<=P0L":"b(an[(81","sCs`< ajc":true},"aq#; 4":[false,"zHdkS","u~SK","A$`ATe|+,",true,"/'",false,[2065404388717637,false,"fI58Jykr","6"],4.058136433038056e+268,"^z<Hm'"],".q^":null}
// • …
```

Resources: [API reference](https://fast-check.dev/api-reference/functions/object.html).  
Available since 0.0.7.

## anything

Generate any kind of entities.

**Signatures:**

- `fc.anything()`
- `fc.anything({key?, depthSize?, maxDepth?, maxKeys?, size?, withBigInt?, withBoxedValues?, withDate?, withMap?, withNullPrototype?, withObjectString?, withSet?, withTypedArray?, values?})`

**with:**

- `key?` — default: `fc.string()` — _arbitrary responsible to generate keys used for instances of objects_
- `depthSize?` — default: `undefined` [more](/docs/configuration/larger-entries-by-default#depth-size-explained) — _how much we allow our recursive structures to be deep?_
- `maxDepth?` — default: `Number.POSITIVE_INFINITY` — _maximal depth for generated objects (Map and Set included into objects)_
- `maxKeys?` — default: `0x7fffffff` [more](/docs/configuration/larger-entries-by-default#size-explained) — _maximal number of keys in generated objects (Map and Set included into objects)_
- `size?` — default: `undefined` [more](/docs/configuration/larger-entries-by-default#size-explained) — _how large should the generated values be?_
- `withBigInt?` — default: `false` — _enable `bigint` - eg.: `1n`_
- `withBoxedValues?` — default: `false` — _enable boxed values - eg.: `new Number(5)`_
- `withDate?` — default: `false` — _enable `Date` - eg.: `new Date('2020-10-14T16:52:36.736Z')`_
- `withMap?` — default: `false` — _enable `Map` - eg.: `new Map([['key', 'value']])`_
- `withNullPrototype?` — default: `false` — _enable objects not defining any prototype - eg.: `Object.create(null)`_
- `withObjectString?` — default: `false` — _enable strings looking as string representations of JavaScript instances - eg.: `"{}"`, `"new Set([1])"`_
- `withSet?` — default: `false` — _enable `Set` - eg.: `new Set([1, 2, 3])`_
- `withTypedArray?` — default: `false` — _enable typed arrays for ints, uints and floats - eg.: `Int8Array.from([1, 2, 3])`_
- `withSparseArray?` — default: `false` — _enable sparse arrays - eg.: `[1,,,3]`_
- `values?` — default: _booleans, numbers, strings, null and undefined_ — _array of arbitraries producing the root* values - *non-object ones_

**Usages:**

```js
fc.anything();
// Examples of generated values:
// • {"iWE$U_3M":-1.1761153457907281e+64,"L8Yr[Em":false,"\":5S":false,"o*&t(b":"{e~\\gX0Ed","oZ":null,"1_0O9":"foL+as'","":[1.0463183151057806e-218,null,true,"`","/|iF"],"Y":"x\"","YP$;D_Cs":-2.406148264784688e+274,"c!lltdK:(_":"bD'arF"}
// • {"3O":[undefined,false,[true,-3.9051738307924134e-153,4.149228362205894e-119,false,false,true,false," D%}6m0",2.799370866495145e-203,-4.091042595321496e+221]],".J":[{"Og*S":"","I9?z([s":-1.1821534452382826e-198},1.7790896502987502e+276,true,-2.376179675473729e-295,true,true,undefined],"~MS":"key"}
// • "ref"
// • null
// • {"key":{},"MTvN8AE0gi":[3405288540635877,"P]z!2",true,-2.387521190971066e-60,null,-3698869638931618,";|s%~j+NA",-6.1815138747104425e-266,{}]}
// • …

fc.anything({
  key: fc.constantFrom('a', 'b', 'c'),
});
// Note: Generated objects will come with keys in ['a', 'b', 'c']
// Examples of generated values:
// • [true,true,null,-5.6688453874368936e+48,false,2014694191684145,"LV$%~%",undefined,"_`qj6\"kX[",""]
// • {"b":{"c":6997371217031069,"b":8609382555061735,"a":5.120009133889531e-261}}
// • ""
// • "Y}q^/9i*"
// • 3467734424335213
// • …

fc.anything({
  maxDepth: 0,
});
// Note: Only root values
// Examples of generated values: -8578863785414675, 2.6e-322, -1.83e-322, 1.9666983140272718e-262, -34…

fc.anything({
  maxDepth: 1,
});
// Examples of generated values:
// • 1.1084525170506736e-156
// • ["&",-951559264941376,",M9|W?"]
// • [-2218061790593050,30]
// • [-8177572456165737,"5",undefined,-6845939437559701,false,"8erNtuc"]
// • -6827243000782837
// • …

fc.anything({
  withBigInt: true,
  withBoxedValues: true,
  withDate: true,
  withMap: true,
  withNullPrototype: true,
  withObjectString: true,
  withSet: true,
  withTypedArray: true,
  withSparseArray: true,
});
// Examples of generated values:
// • new String("D!eS4#")
// • Object.assign(Object.create(null),{"$":[new Map([["M'N",undefined]]),Uint8Array.from([]),{"3919966345171569":-213680302437552}],"__p":[,,,,,,,,,,,,,,"null"],"~IS/I|`z!":new String("\"RV}%x{#{!")})
// • [[new String("rN"),-2.4934302227894897e-45,new String("Q*"),-6.296675947292443e-108,{"":new Number(-5.585429178290063e-167),"_Ce}":undefined,"ixU":new Date("+045104-06-23T13:05:29.148Z"),"@kd<":new Boolean(true),"O":false,"new String(\"h_hTp]s?\")":new Date("+266312-08-17T21:09:42.886Z"),"30kGN)rV":new Number(-129340135145370),"8.?hOT":true},new Number(5.55981238718225e-114)],{"}4Abo,2":20450252201592756193172432841282538403306262949494051486128218300957949155471n,"":{"C":undefined},"Eb({p=":-42997797858025170878640542357153506938454153446818742242133274050107062135766n}]
// • new Set([Int8Array.from([74,124,4,-117])])
// • new Boolean(false)
// • …

fc.anything({
  depthSize: 'medium',
  maxDepth: 1000,
});
// Note: For the moment, we have to specify maxDepth to avoid falling back onto its default value
// Examples of generated values:
// • [true,true,null,-5.6688453874368936e+48,false,2014694191684145,"LV$%~%",undefined,"_`qj6\"kX[",""]
// • {"`?f\"vcr":{"XW71":{"zXAq\"Z5Q":true,"@qs0m!":[5.120009133889531e-261,{"o3i[OWP`=F":{"":4.068510532307745e+281}},2487404948730847],";TuQtZ&=7m":{"'($":null," bkaeV":{"":true,"Aw9+YG]!":-6.879800144762926e+244,"n?L!B#R)n":"g5","'mq.#%I":1.3221798495494814e-101,"}E==:3Bp^T":-7996608749108864,"m":2.6223863023846673e-44,"w|q":3.70106922442221e-186},"!-V+{4":"\\","jwvaZ8":{"zB!nm|":7757208992281711,"h":-4.149080249381332e+195,"aiDLh":"","(Hs)$P*P":1.190747970776708e+91,"%?nT~X[N~\\":undefined,"`.r,*R;I":true},"":[-6523958486123735,undefined,1.2305151888129762e-204,8115823674866317,null,false,4.434127565304523e-183]}},".sfPOsH*41":[-5.01979880119724e-255,"i",-1.4081703508890424e+232,{"m!?ZW`:":"Y{P?$jVp","zq$@`":"fP>v)%C","sE,":[undefined,2467017295150935,[false,1063781909072521],"/>V;[_hAQG","[q:F",1.7094514624379897e+303,"",4.022046823766959e-77,true,false]},undefined,null,-5117919068097772,-1.0529463229722598e-11]}}
// • ""
// • "Y}q^/9i*"
// • 3467734424335213
// • …
```

Resources: [API reference](https://fast-check.dev/api-reference/functions/anything.html).  
Available since 0.0.7.