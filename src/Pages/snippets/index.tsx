import Page from "@/src/Utils/Shared/Page";

export default function(){
    const { params, route, navigate, goBack } = useNavigation("/u/:id");
    return (
        <Page {...{ params, route, navigate, id: "user" }}>
          <p>
            Feed
          </p>
        </Page>
    )
}