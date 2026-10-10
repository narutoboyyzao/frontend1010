const BASE=(import.meta.env.VITE_API_URL||'http://localhost:8080').replace(/\/$/,'')
export type Usuario={id:number;nome:string;email:string;telefone:string|null;cpf:string|null;status:string;role:string;dataCadastro:string}
export type Empresa={id:number;razaoSocial:string;cnpj:string;email:string;telefone:string|null;endereco:string;latitude:number|null;longitude:number|null;status:string}
export type Produto={id:number;nome:string;categoriaId:number;pontosPorKg:number;status:string}
export type Coleta={id:number;usuarioId:number;empresaId:number;status:string;itens:{produtoId:number;quantidadeKg:number;pontosGerados:number}[];pontosTotais:number}
export type UsuarioInput={nome:string;email:string;senha:string;telefone?:string;cpf?:string}
export type EmpresaInput={razaoSocial:string;cnpj:string;email:string;telefone?:string;endereco:string;latitude?:number;longitude?:number}
let token:string|null=sessionStorage.getItem('eletrorecicla_token')||localStorage.getItem('eletrorecicla_token')
export const isAuthenticated=()=>Boolean(token)
export function setToken(value:string|null,remember=false){token=value;sessionStorage.removeItem('eletrorecicla_token');localStorage.removeItem('eletrorecicla_token');if(value)(remember?localStorage:sessionStorage).setItem('eletrorecicla_token',value)}
export class ApiError extends Error{constructor(public status:number,message:string){super(message);this.name='ApiError'}}
export async function request<T>(path:string,options:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(BASE+path,{...options,headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...options.headers}})}catch{throw new ApiError(0,'Não foi possível conectar ao backend. Verifique se ele está em execução.')}if(!response.ok){let message='Erro na requisição ('+response.status+').';try{const data=await response.json();message=data.erro||message}catch{}if(response.status===401&&path!=='/api/v1/auth/login')setToken(null);throw new ApiError(response.status,message)}if(response.status===204)return undefined as T;return response.json() as Promise<T>}
const json=(method:string,body:unknown):RequestInit=>({method,body:JSON.stringify(body)})
export const api={
 login:(email:string,senha:string)=>request<{token:string}>('/api/v1/auth/login',json('POST',{email,senha})),
 registerUser:(data:UsuarioInput)=>request<Usuario>('/api/v1/usuarios',json('POST',data)),
 registerCompany:(data:EmpresaInput)=>request<Empresa>('/api/v1/empresas',json('POST',data)),
 me:()=>request<Usuario>('/api/v1/usuarios/me'),
 updateUser:(id:number,data:Partial<UsuarioInput>)=>request<Usuario>('/api/v1/usuarios/'+id,json('PUT',data)),
 deleteUser:(id:number)=>request<void>('/api/v1/usuarios/'+id,{method:'DELETE'}),
 users:()=>request<Usuario[]>('/api/v1/usuarios'),
 approvedCompanies:()=>request<Empresa[]>('/api/v1/empresas/aprovadas'),
 companies:()=>request<Empresa[]>('/api/v1/empresas'),
 approveCompany:(id:number)=>request<Empresa>('/api/v1/empresas/'+id+'/aprovar',{method:'PATCH'}),
 rejectCompany:(id:number)=>request<Empresa>('/api/v1/empresas/'+id+'/reprovar',{method:'PATCH'}),
 products:()=>request<Produto[]>('/api/v1/produtos'),
 categories:()=>request<{id:number;nome:string}[]>('/api/v1/categorias'),
 myCollections:()=>request<Coleta[]>('/api/v1/coletas/me'),
 collections:()=>request<Coleta[]>('/api/v1/coletas'),
 registerCollection:(empresaId:number,itens:{produtoId:number;quantidadeKg:number}[])=>request<Coleta>('/api/v1/coletas',json('POST',{empresaId,itens}))
}
