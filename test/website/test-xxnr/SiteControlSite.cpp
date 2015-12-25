#include "StdAfx.h"

#include "test-xxnrview.h"
#include "SiteControlSite.h"


    BEGIN_INTERFACE_MAP(CSiteControlSite, COleControlSite)  
          INTERFACE_PART(CSiteControlSite, IID_IOleCommandTarget, CmdTargetObj)  
    END_INTERFACE_MAP()  
      
      
    CSiteView * CSiteControlSite::GetView() const  
    {  
        return STATIC_DOWNCAST(CSiteView, m_pCtrlCont->m_pWnd);  
    }  
      
    ULONG FAR EXPORT CSiteControlSite::XCmdTargetObj::AddRef()  
    {  
        METHOD_PROLOGUE(CSiteControlSite, CmdTargetObj)  
        return pThis->ExternalAddRef();  
    }  
      
    ULONG FAR EXPORT CSiteControlSite::XCmdTargetObj::Release()  
    {  
        METHOD_PROLOGUE(CSiteControlSite, CmdTargetObj)  
        return pThis->ExternalRelease();  
    }  
      
    HRESULT FAR EXPORT CSiteControlSite::XCmdTargetObj::QueryInterface(REFIID iid, void FAR* FAR* ppvObj)  
    {  
        METHOD_PROLOGUE(CSiteControlSite, CmdTargetObj)  
        return (HRESULT)pThis->ExternalQueryInterface(&iid, ppvObj);  
    }  
      
    STDMETHODIMP CSiteControlSite::XCmdTargetObj::QueryStatus(const GUID* pguidCmdGroup, ULONG cCmds, OLECMD rgCmds[],OLECMDTEXT* pcmdtext)  
    {  
        METHOD_PROLOGUE(CSiteControlSite, CmdTargetObj)  
              
        return S_OK;  
    }  
      
    STDMETHODIMP CSiteControlSite::XCmdTargetObj::Exec(const GUID* pguidCmdGroup, DWORD nCmdID, DWORD nCmdExecOpt,VARIANTARG* pvarargIn, VARIANTARG* pvarargOut)  
    {  
        METHOD_PROLOGUE(CSiteControlSite, CmdTargetObj)  
             HRESULT hr = S_OK;  
      
        if (pguidCmdGroup && IsEqualGUID(*pguidCmdGroup, CGID_DocHostCommandHandler))  
        {  
            switch (nCmdID)   
            {  
            case OLECMDID_SHOWSCRIPTERROR:  
                {  
                    // pvaOut 设置为TRUE,继续运行此scripts  
                    (*pvarargOut).vt = VT_BOOL;  
                    (*pvarargOut).boolVal = VARIANT_TRUE;  
                    return S_OK;  
                    break;  
                }  
            default:  
                hr = OLECMDERR_E_NOTSUPPORTED;  
                break;  
            }  
        }  
        else  
        {  
            hr = OLECMDERR_E_UNKNOWNGROUP;  
        }  
        return (hr);  
    }  
