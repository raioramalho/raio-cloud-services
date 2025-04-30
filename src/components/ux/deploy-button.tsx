'use client';

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export function DeployButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full">
          {pending ? "Deploying..." : "Deploy"}
        </Button>
    )
}