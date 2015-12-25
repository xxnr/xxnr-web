#pragma once

    //CSiteControlSite.h  
      
    #include <afxocc.h>  

      
    //CSiteView 继承自CHTMLView  
    class CtestxxnrView;  
#define CSiteView CtestxxnrView
      
    class CSiteControlSite : public COleControlSite  
    {  
    public:  
      
        CSiteControlSite(COleControlContainer* pCtrlCont)   
            : COleControlSite(pCtrlCont)  
        {  
        };  
      
        ~CSiteControlSite()  
        {  
        }  
      
        CSiteView * GetView() const;  
      
    protected:  
    //关键的代码在这里  
        DECLARE_INTERFACE_MAP()  
      
        BEGIN_INTERFACE_PART(CmdTargetObj, IOleCommandTarget)  
             STDMETHOD(QueryStatus)(const GUID*, ULONG, OLECMD[], OLECMDTEXT*);  
             STDMETHOD(Exec)(const GUID*, DWORD, DWORD, VARIANTARG*,VARIANTARG*);  
          END_INTERFACE_PART(CmdTargetObj)  
      
      
        friend class CSiteView;  
    };  